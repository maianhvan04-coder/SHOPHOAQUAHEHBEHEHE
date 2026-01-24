/* eslint-disable react/prop-types */
export default function ProductDescription({ description }) {
  if (!description) return null;

  const { intro, sections = [] } = description;

  return (
    <section
      className="space-y-12"
      itemScope
      itemType="https://schema.org/Product"
    >
      {/* ===== SEO TITLE ===== */}
      <h2 className="text-2xl md:text-3xl font-black uppercase text-gray-800">
        Thông tin sản phẩm
      </h2>

      {/* ===== INTRO (SEO DESCRIPTION) ===== */}
      {intro && (
        <div
          itemProp="description"
          className="prose prose-lg max-w-none prose-img:rounded-xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: intro }}
        />
      )}

      {/* ===== DETAIL SECTIONS ===== */}
      {sections.map((s, index) => {
        if (!s?.content) return null;

        return (
          <section
            key={s.key || index}
            className="space-y-4"
            aria-labelledby={`product-section-${index}`}
          >
            {s.title && (
              <h3
                id={`product-section-${index}`}
                className="text-xl md:text-2xl font-bold text-gray-800"
              >
                {s.title}
              </h3>
            )}

            <div
              className="prose prose-lg max-w-none prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{
                __html: s.content,
              }}
            />
          </section>
        );
      })}
    </section>
  );
}
