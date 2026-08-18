import shutil
from pathlib import Path
from bing_image_downloader import downloader


TARGET_PER_CATEGORY = 150
OUTPUT_DIR = Path("scraped")

queries = {
    "overflowing_bin": "overflowing trash bin street",
    "illegal_dump": "illegal garbage dump roadside India",
    "construction_debris": "construction debris waste pile",
    "hazardous_waste": "hazardous chemical waste barrels dump",
    "drain_blockage": "blocked drain clogged with garbage",
}

# Image extensions we count as valid downloaded files.
VALID_IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp"}


def count_valid_images(folder_path: Path) -> int:
    if not folder_path.exists() or not folder_path.is_dir():
        return 0

    count = 0
    for file_path in folder_path.iterdir():
        if file_path.is_file() and file_path.suffix.lower() in VALID_IMAGE_EXTENSIONS:
            count += 1
    return count


def move_images_to_category(source_dir: Path, target_dir: Path) -> int:
    if not source_dir.exists() or not source_dir.is_dir():
        return 0

    moved_count = 0

    for file_path in source_dir.iterdir():
        if not file_path.is_file() or file_path.suffix.lower() not in VALID_IMAGE_EXTENSIONS:
            continue

        destination = target_dir / file_path.name
        if not destination.exists():
            shutil.move(str(file_path), str(destination))
            moved_count += 1
            continue

        stem = destination.stem
        suffix = destination.suffix
        counter = 1
        while True:
            candidate = target_dir / f"{stem}_{counter}{suffix}"
            if not candidate.exists():
                shutil.move(str(file_path), str(candidate))
                moved_count += 1
                break
            counter += 1

    return moved_count


def sync_category_folder(waste_type: str, query: str) -> Path:
    category_dir = OUTPUT_DIR / waste_type
    legacy_dir = OUTPUT_DIR / query

    category_dir.mkdir(parents=True, exist_ok=True)

    # Merge any old query-named folder into the clean category folder.
    if legacy_dir.exists() and legacy_dir.is_dir() and legacy_dir != category_dir:
        moved_count = move_images_to_category(legacy_dir, category_dir)
        if moved_count > 0:
            print(
                f"Moved {moved_count} legacy images from '{legacy_dir.name}' "
                f"to '{waste_type}'."
            )

    return category_dir


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    summary = {}

    print(f"Target per category: {TARGET_PER_CATEGORY} images")
    print(f"Output directory: {OUTPUT_DIR.resolve()}\n")

    try:
        for waste_type, query in queries.items():
            category_dir = sync_category_folder(waste_type, query)

            existing_count = count_valid_images(category_dir)
            print(f"{waste_type}: {existing_count}/{TARGET_PER_CATEGORY} images")

            remaining = TARGET_PER_CATEGORY - existing_count
            if remaining <= 0:
                print(f"{waste_type} already complete. Skipping.\n")
                summary[waste_type] = existing_count
                continue

            print(f"Downloading remaining {remaining} images for {waste_type}...")

            try:
                # Download into scraped/<waste_type> instead of query-named folders.
                downloader.download(
                    query,
                    limit=remaining,
                    output_dir=str(OUTPUT_DIR),
                    adult_filter_off=False,
                    force_replace=False,
                    timeout=60,
                )

                # Downloader writes to query-named folders, so merge back to category folder.
                sync_category_folder(waste_type, query)
            except Exception as error:
                print(f"Error while downloading {waste_type}: {error}")
                print("Continuing with next category...\n")

            updated_count = count_valid_images(category_dir)
            downloaded_now = max(0, updated_count - existing_count)
            print(
                f"{waste_type} done: {updated_count}/{TARGET_PER_CATEGORY} "
                f"(downloaded {downloaded_now} this run)\n"
            )
            summary[waste_type] = updated_count

    except KeyboardInterrupt:
        print("\nInterrupted by user (Ctrl+C). Progress is saved; run again to continue.\n")

    print("Summary:")
    for waste_type in queries:
        final_count = count_valid_images(OUTPUT_DIR / waste_type)
        summary[waste_type] = final_count
        print(f"- {waste_type}: {final_count}/{TARGET_PER_CATEGORY} images")


if __name__ == "__main__":
    main()