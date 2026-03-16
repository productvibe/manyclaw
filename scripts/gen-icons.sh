#!/usr/bin/env bash
# ManyClaw icon generation script
# Renders icon.svg → PNG at all required sizes, then builds .icns
set -e

REPO="$HOME/Projects/manyclaw"
BUILD="$REPO/build"
WEB="$REPO/website/public"
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
TMPDIR_ICON="$(mktemp -d)"
HTML="$TMPDIR_ICON/icon.html"

echo "→ Generating ManyClaw icons..."

# 1. Wrap SVG in an HTML page for Chrome to screenshot
cat > "$HTML" <<'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; }
body { width: 1024px; height: 1024px; overflow: hidden; background: #2c2418; }
img { display: block; width: 1024px; height: 1024px; }
</style>
</head>
<body>
<img src="file://BUILD_PLACEHOLDER/icon.svg">
</body>
</html>
HTMLEOF

# Substitute actual path
sed -i '' "s|BUILD_PLACEHOLDER|$BUILD|g" "$HTML"

# 2. Render 1024×1024 PNG via Chrome headless
echo "→ Rendering 1024×1024 PNG via Chrome headless..."
"$CHROME" \
  --headless=old \
  --disable-gpu \
  --no-sandbox \
  --screenshot="$BUILD/icon.png" \
  --window-size=1024,1024 \
  --hide-scrollbars \
  "file://$HTML" 2>/dev/null

echo "→ icon.png written ($(wc -c < "$BUILD/icon.png" | tr -d ' ') bytes)"

# 3. Resize to web sizes using sips
echo "→ Resizing to 512 and 192..."
sips -z 512 512 "$BUILD/icon.png" --out "$WEB/icon-512.png" > /dev/null
sips -z 192 192 "$BUILD/icon.png" --out "$WEB/icon-192.png" > /dev/null
echo "→ icon-512.png and icon-192.png written"

# 4. Build .iconset directory for iconutil
echo "→ Building .iconset..."
ICONSET="$TMPDIR_ICON/icon.iconset"
mkdir -p "$ICONSET"

sizes=(16 32 64 128 256 512)
for sz in "${sizes[@]}"; do
  sips -z $sz $sz "$BUILD/icon.png" --out "$ICONSET/icon_${sz}x${sz}.png" > /dev/null
  # @2x = double pixel density (e.g. 32px file for 16pt @2x)
  double=$((sz * 2))
  sips -z $double $double "$BUILD/icon.png" --out "$ICONSET/icon_${sz}x${sz}@2x.png" > /dev/null
done
# iconutil also wants 1024x1024@1x
cp "$BUILD/icon.png" "$ICONSET/icon_512x512@2x.png"

# 5. Convert to .icns
echo "→ Building .icns..."
iconutil -c icns "$ICONSET" -o "$BUILD/icon.icns"
echo "→ icon.icns written ($(wc -c < "$BUILD/icon.icns" | tr -d ' ') bytes)"

# 6. Cleanup
rm -rf "$TMPDIR_ICON"

echo ""
echo "✓ Done. Files written:"
echo "  $BUILD/icon.png       (1024×1024)"
echo "  $BUILD/icon.icns      (macOS icon bundle)"
echo "  $WEB/icon-512.png     (512×512)"
echo "  $WEB/icon-192.png     (192×192)"
echo "  $WEB/logo.svg         (wordmark — already written)"
