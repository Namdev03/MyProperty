import { useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";

/**
 * Combines every available image source into one pool:
 * hero = first propertyImage (falls back to first image found anywhere)
 * thumbs = everything else, deduped, capped at 4 visible + "+N more" overlay
 * Click any image (hero or thumb) to open a full lightbox with arrow nav.
 */
export function PropertyGallery({ property }) {
  const allImages = useMemo(() => {
    const raw = [
      ...(property?.propertyImages || []),
      ...(property?.roomImages || []),
      ...(property?.hallImages || []),
      ...(property?.bathroomImages || []),
      ...(property?.kitchenImages || []),
    ];

    // Backend stores images as { publicId, url }; support plain string
    // arrays too so this component works with either shape.
    const urls = raw.map((img) => (typeof img === "string" ? img : img?.url)).filter(Boolean);

    return [...new Set(urls)];
  }, [property]);

  const [hero, ...rest] = allImages;
  const visibleThumbs = rest.slice(0, 4);
  const extraCount = rest.length - visibleThumbs.length;

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null;

  const openAt = (img) => setLightboxIndex(allImages.indexOf(img));
  const close = () => setLightboxIndex(null);
  const prev = () =>
    setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length);
  const next = () => setLightboxIndex((i) => (i + 1) % allImages.length);

  // keyboard nav + scroll lock while lightbox is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  if (!hero) {
    return (
      <div className="flex h-72 w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <>
      {/* ---------- Mobile (< lg): hero + horizontal scroll strip ---------- */}
      <div className="lg:hidden">
        <img
          src={hero}
          alt="Property"
          onClick={() => openAt(hero)}
          className="h-72 w-full cursor-pointer rounded-2xl object-cover shadow-md sm:h-80"
        />
        {rest.length > 0 && (
          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {rest.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Property view ${i + 2}`}
                onClick={() => openAt(img)}
                className="h-24 w-32 shrink-0 cursor-pointer snap-start rounded-lg object-cover shadow transition active:scale-95"
              />
            ))}
          </div>
        )}
      </div>

      {/* ---------- Desktop (lg+): hero left, thumbnail grid right ---------- */}
      <div className="hidden gap-4 lg:grid lg:grid-cols-4">
        <div className="lg:col-span-2">
          <img
            src={hero}
            alt="Property"
            onClick={() => openAt(hero)}
            className="h-[500px] w-full cursor-pointer rounded-2xl object-cover shadow-lg transition duration-300 hover:brightness-95"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:col-span-2">
          {visibleThumbs.map((img, i) => {
            const isLastVisible = i === visibleThumbs.length - 1 && extraCount > 0;
            return (
              <div key={i} className="relative">
                <img
                  src={img}
                  alt={`Property view ${i + 2}`}
                  onClick={() => openAt(img)}
                  className="h-[240px] w-full cursor-pointer rounded-xl object-cover shadow transition duration-300 hover:scale-[0.97]"
                />
                {isLastVisible && (
                  <button
                    onClick={() => openAt(img)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/60 text-white transition hover:bg-black/70"
                  >
                    <Images size={22} />
                    <span className="text-lg font-semibold">+{extraCount} more</span>
                  </button>
                )}
              </div>
            );
          })}

          {/* Fill empty slots gracefully if fewer than 4 thumbnails exist */}
          {visibleThumbs.length === 0 &&
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex h-[240px] w-full items-center justify-center rounded-xl bg-gray-50 text-sm text-gray-300"
              >
                No image
              </div>
            ))}
        </div>
      </div>

      {/* ---------- Lightbox ---------- */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            onClick={close}
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <X size={28} />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="absolute left-2 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white sm:left-6"
          >
            <ChevronLeft size={32} />
          </button>

          <img
            src={allImages[lightboxIndex]}
            alt={`Property view ${lightboxIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
          />

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="absolute right-2 rounded-full p-2 text-white/80 transition hover:bg-white/10 hover:text-white sm:right-6"
          >
            <ChevronRight size={32} />
          </button>

          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white">
            {lightboxIndex + 1} / {allImages.length}
          </span>
        </div>
      )}
    </>
  );
}
