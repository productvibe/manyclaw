#!/usr/bin/env bash
# ManyClaw icon generation script
# Renders icon.svg → PNG at all required sizes, then builds .icns
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BUILD="$(cd "$SCRIPT_DIR/.." && pwd)/build"
WEB="$(cd "$SCRIPT_DIR/../../.." && pwd)/website/public"
TMPDIR_ICON="$(mktemp -d)"
SWIFT_RENDER="$TMPDIR_ICON/render.swift"

echo "→ Generating ManyClaw icons..."

# 1. Render SVG → PNG with transparency using Swift + CoreGraphics (no deps needed)
echo "→ Rendering 1024×1024 PNG via Swift/CoreGraphics..."
cat > "$SWIFT_RENDER" <<'SWIFTEOF'
import AppKit
let args = CommandLine.arguments
let svgPath = args[1]
let outPath = args[2]
let svgData = try! Data(contentsOf: URL(fileURLWithPath: svgPath))
let image = NSImage(data: svgData)!
let size = NSSize(width: 1024, height: 1024)
let rep = NSBitmapImageRep(
    bitmapDataPlanes: nil, pixelsWide: 1024, pixelsHigh: 1024,
    bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
    isPlanar: false, colorSpaceName: .deviceRGB,
    bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
image.draw(in: NSRect(origin: .zero, size: size))
NSGraphicsContext.restoreGraphicsState()
let png = rep.representation(using: .png, properties: [:])!
try! png.write(to: URL(fileURLWithPath: outPath))
SWIFTEOF
swift "$SWIFT_RENDER" "$BUILD/icon.svg" "$BUILD/icon.png"

echo "→ icon.png written ($(wc -c < "$BUILD/icon.png" | tr -d ' ') bytes)"

# 2. Resize to web sizes using sips
echo "→ Resizing to 512 and 192..."
sips -z 512 512 "$BUILD/icon.png" --out "$WEB/icon-512.png" > /dev/null
sips -z 192 192 "$BUILD/icon.png" --out "$WEB/icon-192.png" > /dev/null
echo "→ icon-512.png and icon-192.png written"

# 3. Build .iconset directory for iconutil
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

# 4. Convert to .icns
echo "→ Building .icns..."
iconutil -c icns "$ICONSET" -o "$BUILD/icon.icns"
echo "→ icon.icns written ($(wc -c < "$BUILD/icon.icns" | tr -d ' ') bytes)"

# 5. Cleanup
rm -rf "$TMPDIR_ICON"

echo ""
echo "✓ Done. Files written:"
echo "  $BUILD/icon.png       (1024×1024)"
echo "  $BUILD/icon.icns      (macOS icon bundle)"
echo "  $WEB/icon-512.png     (512×512)"
echo "  $WEB/icon-192.png     (192×192)"
