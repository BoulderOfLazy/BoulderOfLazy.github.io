#!/usr/bin/env python3
"""Refresh EUR prices and review ratings in the static game catalog."""

from __future__ import annotations

import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from html.parser import HTMLParser
from pathlib import Path
from typing import Any


MAX_RESPONSE_BYTES = 8 * 1024 * 1024
RETRYABLE_HTTP_CODES = {429, 500, 502, 503, 504}
USER_AGENT = "VRGameCatalogPriceUpdater/1.0 (+https://github.com/BoulderOfLazy/BoulderOfLazy.github.io)"
MONTHS_RU = (
    "января", "февраля", "марта", "апреля", "мая", "июня",
    "июля", "августа", "сентября", "октября", "ноября", "декабря",
)
UPDATE_DATE_PATTERN = re.compile(
    r'(<i\s+id=["\']prices-update-date["\'][^>]*>).*?(</i>)',
    re.IGNORECASE | re.DOTALL,
)
JSON_LD_PATTERN = re.compile(
    r'<script\b[^>]*\btype\s*=\s*["\']application/ld\+json["\'][^>]*>(.*?)</script>',
    re.IGNORECASE | re.DOTALL,
)
PRICE_NUMBER_PATTERN = re.compile(r"\d+(?:[.,]\d{1,2})?")


class UpdateError(Exception):
    """An upstream or catalog error that should be reported without overwriting data."""


def is_allowed_https_url(url: str, allowed_hosts: tuple[str, ...]) -> bool:
    parsed = urllib.parse.urlparse(url)
    host = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and any(
        host == domain or host.endswith(f".{domain}") for domain in allowed_hosts
    )


class AllowedRedirectHandler(urllib.request.HTTPRedirectHandler):
    def __init__(self, allowed_hosts: tuple[str, ...]):
        super().__init__()
        self.allowed_hosts = allowed_hosts

    def redirect_request(self, request, response, code, message, headers, new_url):
        if not is_allowed_https_url(new_url, self.allowed_hosts):
            raise UpdateError("Источник перенаправил запрос на неразрешённый HTTPS-домен.")
        return super().redirect_request(request, response, code, message, headers, new_url)


def fetch_bytes(
    url: str,
    allowed_hosts: tuple[str, ...],
    *,
    delay: float = 0.0,
    attempts: int = 3,
) -> bytes:
    if not is_allowed_https_url(url, allowed_hosts):
        raise UpdateError(f"Запрещённый URL источника: {url}")

    opener = urllib.request.build_opener(AllowedRedirectHandler(allowed_hosts))
    last_error: Exception | None = None
    for attempt in range(attempts):
        if delay:
            time.sleep(delay)
        request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "*/*"})
        try:
            with opener.open(request, timeout=25) as response:
                payload = response.read(MAX_RESPONSE_BYTES + 1)
            if len(payload) > MAX_RESPONSE_BYTES:
                raise UpdateError("Ответ источника превышает лимит 8 МБ.")
            return payload
        except urllib.error.HTTPError as error:
            last_error = error
            if error.code not in RETRYABLE_HTTP_CODES or attempt + 1 == attempts:
                break
            retry_after = error.headers.get("Retry-After", "")
            try:
                wait = min(float(retry_after), 15.0)
            except ValueError:
                wait = 2**attempt
            time.sleep(max(0.0, wait))
        except (urllib.error.URLError, TimeoutError, OSError, UpdateError) as error:
            last_error = error
            if isinstance(error, UpdateError) or attempt + 1 == attempts:
                break
            time.sleep(2**attempt)

    if isinstance(last_error, urllib.error.HTTPError):
        raise UpdateError(f"HTTP {last_error.code} от {urllib.parse.urlparse(url).hostname}.") from last_error
    if last_error:
        raise UpdateError(f"Не удалось получить данные: {last_error}") from last_error
    raise UpdateError("Не удалось получить ответ от источника.")


def fetch_json(url: str, allowed_hosts: tuple[str, ...], *, delay: float = 0.0) -> Any:
    payload = fetch_bytes(url, allowed_hosts, delay=delay)
    try:
        return json.loads(payload.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error:
        raise UpdateError("Источник вернул некорректный JSON.") from error


def parse_amount(value: Any) -> Decimal | None:
    if value is None or isinstance(value, bool):
        return None
    text = str(value).strip()
    match = PRICE_NUMBER_PATTERN.search(text)
    if not match:
        return None
    try:
        amount = Decimal(match.group().replace(",", "."))
    except InvalidOperation:
        return None
    return amount if amount.is_finite() and amount >= 0 else None


def format_eur(amount: Decimal) -> str:
    return f"{amount:.2f}€"


def _cents_amount(value: Any) -> Decimal | None:
    if isinstance(value, bool):
        return None
    try:
        cents = int(value)
    except (TypeError, ValueError, OverflowError):
        return None
    return Decimal(cents) / 100 if cents >= 0 else None


def steam_price_values(details: dict[str, Any]) -> tuple[str, str] | None:
    """Return (current, original-if-discounted); None means price data was unavailable."""
    if details.get("is_free") is True:
        return "Бесплатно", ""
    overview = details.get("price_overview")
    if not isinstance(overview, dict) or overview.get("currency") != "EUR":
        return None

    initial = _cents_amount(overview.get("initial"))
    final = _cents_amount(overview.get("final"))
    if initial is None:
        initial = parse_amount(overview.get("initial_formatted"))
    if final is None:
        final = parse_amount(overview.get("final_formatted"))
    current = final if final is not None else initial
    if current is None:
        return None
    original = format_eur(initial) if initial is not None and initial > current else ""
    return format_eur(current), original


def steam_rating_value(payload: dict[str, Any]) -> str:
    summary = payload.get("query_summary")
    if not isinstance(summary, dict):
        raise UpdateError("Steam не вернул сводку отзывов.")
    try:
        positive = int(summary["total_positive"])
        negative = int(summary["total_negative"])
    except (KeyError, TypeError, ValueError) as error:
        raise UpdateError("В сводке Steam отсутствуют счётчики отзывов.") from error
    if positive < 0 or negative < 0:
        raise UpdateError("Steam вернул некорректное количество отзывов.")
    total = positive + negative
    percentage = int(Decimal(positive * 100) / Decimal(total) + Decimal("0.5")) if total else 0
    return f"{percentage}%" if total else "N/A"


class MetaRatingParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.rating: str | None = None

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag.lower() != "meta":
            return
        values = {key.lower(): value for key, value in attrs}
        if (values.get("itemprop") or "").lower() == "ratingvalue":
            self.rating = values.get("content")


def _jsonld_nodes(html: str) -> list[dict[str, Any]]:
    nodes: list[dict[str, Any]] = []

    def add(value: Any) -> None:
        if isinstance(value, list):
            for item in value:
                add(item)
        elif isinstance(value, dict):
            graph = value.get("@graph")
            if isinstance(graph, list):
                add(graph)
            else:
                nodes.append(value)

    for match in JSON_LD_PATTERN.finditer(html):
        try:
            add(json.loads(match.group(1)))
        except json.JSONDecodeError:
            continue
    return nodes


def _offers_list(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, dict):
        return [value]
    if isinstance(value, list):
        return [offer for offer in value if isinstance(offer, dict)]
    return []


def _price_specifications(offer: dict[str, Any]) -> list[dict[str, Any]]:
    value = offer.get("priceSpecification")
    if isinstance(value, dict):
        return [value]
    if isinstance(value, list):
        return [spec for spec in value if isinstance(spec, dict)]
    return []


def meta_price_values(product: dict[str, Any]) -> tuple[str, str] | None:
    offers = _offers_list(product.get("offers"))
    for offer in offers:
        offer_currency = offer.get("priceCurrency")
        specifications = _price_specifications(offer)
        currencies = {
            spec.get("priceCurrency")
            for spec in specifications
            if spec.get("priceCurrency")
        }
        if offer_currency and offer_currency != "EUR":
            continue
        if currencies and currencies != {"EUR"}:
            continue

        regular_spec = next(
            (
                spec for spec in specifications
                if re.search(r"strikethroughprice$", str(spec.get("priceType", "")), re.IGNORECASE)
            ),
            None,
        )
        regular = parse_amount(regular_spec.get("price")) if regular_spec else None
        current = parse_amount(offer.get("price"))
        if current is None:
            current = next(
                (
                    amount
                    for spec in specifications
                    if not re.search(r"strikethroughprice$", str(spec.get("priceType", "")), re.IGNORECASE)
                    if (amount := parse_amount(spec.get("price"))) is not None
                ),
                None,
            )
        if current is None and regular is not None:
            current = regular
        if current is None:
            continue
        if regular is not None and regular > current:
            return format_eur(current), format_eur(regular)
        return format_eur(regular if regular is not None else current), ""
    return None


def meta_rating_value(product: dict[str, Any], html: str) -> str:
    aggregate = product.get("aggregateRating")
    raw_rating = aggregate.get("ratingValue") if isinstance(aggregate, dict) else None
    if raw_rating is None:
        parser = MetaRatingParser()
        parser.feed(html)
        raw_rating = parser.rating
    rating = parse_amount(raw_rating)
    if rating is None or rating <= 0 or rating > 5:
        return "N/A"
    value = format(rating.normalize(), "f")
    return f"{value}/5"


def parse_meta_page(html: str, expected_id: str | None = None) -> dict[str, Any]:
    nodes = _jsonld_nodes(html)
    products = []
    for node in nodes:
        types = node.get("@type", [])
        if isinstance(types, str):
            types = [types]
        if not any(str(value).rsplit("/", 1)[-1] == "Product" for value in types):
            continue
        sku = str(node.get("sku", ""))
        if expected_id and sku and sku != expected_id:
            continue
        products.append(node)
    if not products:
        raise UpdateError("В JSON-LD страницы Meta не найден продукт этой игры.")
    product = products[0]
    result: dict[str, Any] = {
        "metaRating": meta_rating_value(product, html),
    }
    prices = meta_price_values(product)
    if prices is not None:
        result["metaPrice"], result["metaOriginalPrice"] = prices
    return result


def steam_app_id(url: str) -> str | None:
    parsed = urllib.parse.urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme not in ("http", "https") or not (
        host == "steampowered.com" or host.endswith(".steampowered.com")
    ):
        return None
    match = re.match(r"^/app/(\d+)(?:/|$)", parsed.path)
    return match.group(1) if match else None


def meta_experience_id(url: str) -> str | None:
    parsed = urllib.parse.urlparse(url)
    host = (parsed.hostname or "").lower()
    if parsed.scheme not in ("http", "https") or not (
        host == "meta.com" or host.endswith(".meta.com")
    ):
        return None
    match = re.search(r"/(\d+)/?$", parsed.path)
    return match.group(1) if match else None


def display_update_date(now: datetime | None = None) -> str:
    current = (now or datetime.now(timezone.utc)).astimezone(timezone.utc)
    return f"{current.day} {MONTHS_RU[current.month - 1]} {current.year} года"


def set_prices_update_date(html: str, date_text: str) -> str:
    updated, replacements = UPDATE_DATE_PATTERN.subn(rf"\g<1>Цены и отзывы обновлены: {date_text}\g<2>", html, count=1)
    if not replacements:
        raise UpdateError('В vr_games_list.html не найден элемент #prices-update-date.')
    return updated


class CatalogUpdater:
    def __init__(self, project_root: Path, delay: float = 0.25, dry_run: bool = False):
        self.root = project_root.resolve()
        self.delay = max(0.0, delay)
        self.dry_run = dry_run
        self.warnings: list[str] = []
        self.checked = 0
        self.price_updates = 0
        self.rating_updates = 0

    def _fetch_steam(self, app_id: str, game: dict[str, Any]) -> None:
        store_hosts = ("steampowered.com",)
        details_url = f"https://store.steampowered.com/api/appdetails?appids={app_id}&cc=de&l=en"
        try:
            payload = fetch_json(details_url, store_hosts, delay=self.delay)
            app = payload.get(app_id) if isinstance(payload, dict) else None
            details = app.get("data") if isinstance(app, dict) and app.get("success") else None
            if not isinstance(details, dict):
                raise UpdateError("Steam Store не вернул данные игры.")
            self.checked += 1
            prices = steam_price_values(details)
            if prices is not None:
                game["steamPrice"], original = prices
                if original:
                    game["steamOriginalPrice"] = original
                else:
                    game.pop("steamOriginalPrice", None)
                self.price_updates += 1
            else:
                self.warnings.append(f"{game.get('title', app_id)} / Steam: цена в евро недоступна.")
        except UpdateError as error:
            self.warnings.append(f"{game.get('title', app_id)} / Steam Store: {error}")

        reviews_url = (
            f"https://store.steampowered.com/appreviews/{app_id}"
            "?json=1&language=all&purchase_type=all&filter=all"
        )
        try:
            payload = fetch_json(reviews_url, store_hosts, delay=self.delay)
            game["steamRating"] = steam_rating_value(payload)
            self.rating_updates += 1
            self.checked += 1
        except UpdateError as error:
            self.warnings.append(f"{game.get('title', app_id)} / Steam reviews: {error}")

    def _fetch_meta(self, url: str, experience_id: str, game: dict[str, Any]) -> None:
        try:
            html = fetch_bytes(url, ("meta.com",), delay=self.delay).decode("utf-8-sig", errors="replace")
            values = parse_meta_page(html, experience_id)
            self.checked += 1
            if "metaPrice" in values:
                game["metaPrice"] = values["metaPrice"]
                original = values["metaOriginalPrice"]
                if original:
                    game["metaOriginalPrice"] = original
                else:
                    game.pop("metaOriginalPrice", None)
                self.price_updates += 1
            game["metaRating"] = values["metaRating"]
            self.rating_updates += 1
        except UpdateError as error:
            self.warnings.append(f"{game.get('title', experience_id)} / Meta Store: {error}")

    def run(self, selected_slugs: set[str] | None = None) -> int:
        index_path = self.root / "vr-stuff" / "games" / "index.json"
        try:
            entries = json.loads(index_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as error:
            raise UpdateError(f"Не удалось прочитать каталог {index_path}: {error}") from error
        if not isinstance(entries, list):
            raise UpdateError("vr-stuff/games/index.json должен содержать массив.")

        pending_game_writes: dict[Path, str] = {}
        for entry in entries:
            if not isinstance(entry, dict):
                self.warnings.append("Пропущена некорректная запись в index.json.")
                continue
            slug = entry.get("slug")
            if selected_slugs and slug not in selected_slugs:
                continue
            relative = entry.get("path")
            if not isinstance(relative, str):
                self.warnings.append(f"{entry.get('title', slug)}: в index.json нет пути к data.json.")
                continue
            game_path = (self.root / Path(relative)).resolve()
            if not game_path.is_relative_to(self.root) or not game_path.is_file():
                self.warnings.append(f"{entry.get('title', slug)}: небезопасный или отсутствующий путь {relative}.")
                continue
            try:
                original_text = game_path.read_text(encoding="utf-8")
                game = json.loads(original_text)
            except (OSError, json.JSONDecodeError) as error:
                self.warnings.append(f"{entry.get('title', slug)}: не удалось прочитать data.json ({error}).")
                continue
            if not isinstance(game, dict):
                self.warnings.append(f"{entry.get('title', slug)}: data.json должен содержать объект.")
                continue
            before = json.dumps(game, ensure_ascii=False, indent=2) + "\n"

            steam_link = game.get("steamLink", "")
            app_id = steam_app_id(steam_link) if isinstance(steam_link, str) and steam_link else None
            if app_id:
                self._fetch_steam(app_id, game)
            elif steam_link:
                self.warnings.append(f"{game.get('title', slug)}: ссылка Steam некорректна, импорт пропущен.")

            meta_link = game.get("metaLink", "")
            experience_id = meta_experience_id(meta_link) if isinstance(meta_link, str) and meta_link else None
            if experience_id:
                self._fetch_meta(meta_link, experience_id, game)
            elif meta_link:
                self.warnings.append(f"{game.get('title', slug)}: ссылка Meta Store некорректна, импорт пропущен.")

            updated_text = json.dumps(game, ensure_ascii=False, indent=2) + "\n"
            if updated_text != before:
                pending_game_writes[game_path] = updated_text

        if self.checked == 0:
            details = self.warnings[0] if self.warnings else "В каталоге нет игр с доступными ссылками на магазины."
            raise UpdateError(f"Ни один источник не вернул корректные данные; дата обновления не изменена. {details}")

        html_path = self.root / "vr_games_list.html"
        try:
            html = html_path.read_text(encoding="utf-8")
            updated_html = set_prices_update_date(html, display_update_date())
        except (OSError, UpdateError) as error:
            raise UpdateError(f"Не удалось обновить дату в vr_games_list.html: {error}") from error
        changed_files = len(pending_game_writes) + (updated_html != html)
        if not self.dry_run:
            for game_path, updated_text in pending_game_writes.items():
                game_path.write_text(updated_text, encoding="utf-8", newline="\n")
            if updated_html != html:
                html_path.write_text(updated_html, encoding="utf-8", newline="\n")

        print(
            f"Проверено ответов источников: {self.checked}; обновлено цен: {self.price_updates}; "
            f"обновлено рейтингов: {self.rating_updates}; изменено файлов: {changed_files}."
        )
        if self.dry_run:
            print("Dry run: файлы каталога не записывались.")
        if self.warnings:
            print(f"Предупреждений: {len(self.warnings)}.", file=sys.stderr)
            for warning in self.warnings[:30]:
                print(f"Предупреждение: {warning}", file=sys.stderr)
            if len(self.warnings) > 30:
                print(f"...и ещё {len(self.warnings) - 30} предупреждений.", file=sys.stderr)
        return changed_files


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Папка корня сайта (по умолчанию — корень текущего репозитория).",
    )
    parser.add_argument("--dry-run", action="store_true", help="Проверить источники, не записывая файлы.")
    parser.add_argument("--slug", action="append", help="Обновить только указанную игру; можно указать несколько раз.")
    parser.add_argument("--delay", type=float, default=0.25, help="Пауза между запросами к магазинам в секундах.")
    args = parser.parse_args()
    if args.delay < 0:
        parser.error("--delay не может быть отрицательным.")
    try:
        CatalogUpdater(args.project_root, delay=args.delay, dry_run=args.dry_run).run(
            set(args.slug) if args.slug else None
        )
    except UpdateError as error:
        print(f"Ошибка обновления: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
