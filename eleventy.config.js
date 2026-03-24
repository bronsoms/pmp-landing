export default function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/fonts");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/sitemap.xml");

  // Storyblok Visual Editor: output _editable comment as filter
  eleventyConfig.addFilter("sbEditable", function(blok) {
    if (blok && blok._editable) {
      return blok._editable;
    }
    return '';
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/"
  };
}
