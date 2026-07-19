from pathlib import Path
import shutil

def flatten_copy(src_dir, dst_dir):
    src_dir = Path(src_dir)
    dst_dir = Path(dst_dir)
    dst_dir.mkdir(parents=True, exist_ok=True)

    used_names = {}

    for file_path in src_dir.rglob("*"):
        if file_path.is_file():
            rel_path = file_path.relative_to(src_dir)
            flat_name = "__".join(rel_path.parts)

            # 同名衝突回避
            if flat_name in used_names:
                used_names[flat_name] += 1
                stem = Path(flat_name).stem
                suffix = Path(flat_name).suffix
                flat_name = f"{stem}_{used_names[flat_name]}{suffix}"
            else:
                used_names[flat_name] = 0

            dst_path = dst_dir / flat_name
            shutil.copy2(file_path, dst_path)


if __name__ == "__main__":
    flatten_copy("./src", ".claude/src")
    flatten_copy("./public", "./.claude/public")
    #import sys
    #
    #if len(sys.argv) != 3:
    #    print("usage: python script.py <source_dir> <dest_dir>")
    #else:
    #    flatten_copy(sys.argv[1], sys.argv[2])
        