import type { Style } from "./styles";

export type ShopCategory =
  | "cushion_cover"
  | "rug"
  | "sofa"
  | "armchair"
  | "coffee_table"
  | "side_table"
  | "floor_lamp"
  | "wall_art"
  | "planter"
  | "curtain_or_throw";

export type StyleTag =
  | "minimalist_warm"
  | "boho_india"
  | "indian_contemporary"
  | "scandi_warm_indian";

export type ShopProduct = {
  id: string;
  name: string;
  category: ShopCategory;
  styleTags: StyleTag[];
  priceINR: number;
  description: string;
  amazonSearchQuery: string;
  visualKeyword: string; // 3-5 tokens, material + color + noun — for SD prompt injection
  imageUrl: string | null;
  asin?: string;
};

export const STYLE_TO_TAG: Record<Style, StyleTag> = {
  "Minimalist Warm": "minimalist_warm",
  "Boho India": "boho_india",
  "Indian Contemporary": "indian_contemporary",
  "Scandi-Warm Indian": "scandi_warm_indian",
};

export const TAG_TO_STYLE: Record<StyleTag, Style> = {
  minimalist_warm: "Minimalist Warm",
  boho_india: "Boho India",
  indian_contemporary: "Indian Contemporary",
  scandi_warm_indian: "Scandi-Warm Indian",
};

export const CATEGORY_LABELS: Record<ShopCategory, string> = {
  cushion_cover: "Cushion covers",
  rug: "Rug",
  sofa: "Sofa",
  armchair: "Armchair",
  coffee_table: "Coffee table",
  side_table: "Side table",
  floor_lamp: "Floor lamp",
  wall_art: "Wall art",
  planter: "Planter",
  curtain_or_throw: "Curtain / Throw",
};

export const SHOP_CATALOG: ShopProduct[] = [
  // ---- Minimalist Warm ----
  { id: "mw_cu_1", name: "Beige linen cushion covers, set of 2, 40x40cm", category: "cushion_cover", styleTags: ["minimalist_warm"], priceINR: 599, description: "Soft stone-washed linen in warm beige. Hidden zip, cotton fill compatible.", amazonSearchQuery: "beige linen cushion covers set of 2 40x40", visualKeyword: "beige linen cushions", imageUrl: null },
  { id: "mw_cu_2", name: "Ivory cotton cushion covers, set of 4, 45x45cm, textured weave", category: "cushion_cover", styleTags: ["minimalist_warm"], priceINR: 1199, description: "Crisp ivory cotton with subtle herringbone texture. Brass-finish concealed zip.", amazonSearchQuery: "ivory cotton cushion covers set of 4 45x45 textured", visualKeyword: "ivory textured cotton cushions", imageUrl: null },
  { id: "mw_cu_3", name: "Oatmeal wool-blend cushion covers, set of 2, 50x50cm", category: "cushion_cover", styleTags: ["minimalist_warm"], priceINR: 1799, description: "Chunky oatmeal wool blend with neutral undertones. Handwoven feel.", amazonSearchQuery: "oatmeal wool blend cushion covers set of 2 50x50", visualKeyword: "oatmeal wool cushions", imageUrl: null },

  { id: "mw_ru_1", name: "Cream jute flatweave rug, 4x6 ft", category: "rug", styleTags: ["minimalist_warm"], priceINR: 2799, description: "Hand-loomed jute with a tight flat weave. Warm neutral base.", amazonSearchQuery: "cream jute flatweave rug 4x6 feet", visualKeyword: "cream jute flatweave rug", imageUrl: null },
  { id: "mw_ru_2", name: "Ivory wool shaggy rug, 5x7 ft", category: "rug", styleTags: ["minimalist_warm"], priceINR: 4599, description: "Plush ivory wool pile, 35mm thickness. Non-slip backing.", amazonSearchQuery: "ivory wool shaggy rug 5x7 feet", visualKeyword: "ivory wool shag rug", imageUrl: null },
  { id: "mw_ru_3", name: "Beige hand-tufted wool rug, 6x9 ft", category: "rug", styleTags: ["minimalist_warm"], priceINR: 7299, description: "Hand-tufted pure wool with subtle pile-height variation. Anti-skid latex backing.", amazonSearchQuery: "beige hand tufted wool rug 6x9 feet", visualKeyword: "beige tufted wool rug", imageUrl: null },

  { id: "mw_so_budget", name: "Compact 3-seater fabric sofa, beige polyester-linen, oak-finish legs, 68 inch", category: "sofa", styleTags: ["minimalist_warm"], priceINR: 13999, description: "Budget-friendly 3-seater in beige polyester-linen blend on oak-finish legs. Firm foam seats, knock-down assembly.", amazonSearchQuery: "compact 3 seater fabric sofa beige polyester linen oak legs 68 inch", visualKeyword: "beige fabric compact sofa", imageUrl: null },
  { id: "mw_so_1", name: "Linen-blend 3-seater sofa, beige, 72 inch, solid wood legs", category: "sofa", styleTags: ["minimalist_warm"], priceINR: 18999, description: "Low-profile sofa in warm beige linen blend. Removable seat cushions.", amazonSearchQuery: "linen blend 3 seater sofa beige 72 inch solid wood legs", visualKeyword: "beige linen sofa", imageUrl: null },
  { id: "mw_so_2", name: "Upholstered 3-seater sofa with walnut legs, cream, 78 inch", category: "sofa", styleTags: ["minimalist_warm"], priceINR: 28999, description: "Cream upholstery, walnut-finished solid wood legs, pocket spring seat.", amazonSearchQuery: "upholstered 3 seater sofa walnut legs cream 78 inch", visualKeyword: "cream walnut-leg sofa", imageUrl: null },
  { id: "mw_so_3", name: "Modular L-shape sofa, ivory linen, 94 inch, right-facing", category: "sofa", styleTags: ["minimalist_warm"], priceINR: 42999, description: "Modular corner sofa in ivory linen with reversible chaise and pocket springs.", amazonSearchQuery: "modular L shape sofa ivory linen 94 inch right facing", visualKeyword: "ivory L-shape linen sofa", imageUrl: null },

  { id: "mw_ar_1", name: "Linen accent armchair, beige, wooden legs", category: "armchair", styleTags: ["minimalist_warm"], priceINR: 7499, description: "Compact accent chair in beige linen with tapered walnut-finished legs.", amazonSearchQuery: "linen accent armchair beige wooden legs", visualKeyword: "beige linen armchair", imageUrl: null },
  { id: "mw_ar_2", name: "Cream bouclé armchair with oak frame", category: "armchair", styleTags: ["minimalist_warm"], priceINR: 11999, description: "Plush cream bouclé upholstery on a solid oak-finish frame.", amazonSearchQuery: "cream boucle armchair oak frame", visualKeyword: "cream bouclé armchair", imageUrl: null },
  { id: "mw_ar_3", name: "Wingback lounge armchair, light beige linen", category: "armchair", styleTags: ["minimalist_warm"], priceINR: 16499, description: "Classic wingback silhouette in light beige linen with solid wood legs.", amazonSearchQuery: "wingback lounge armchair light beige linen", visualKeyword: "beige linen wingback", imageUrl: null },

  { id: "mw_co_1", name: "Oak veneer round coffee table, 30 inch", category: "coffee_table", styleTags: ["minimalist_warm"], priceINR: 4999, description: "Round oak-veneer top with tapered metal base. 18-inch height.", amazonSearchQuery: "oak veneer round coffee table 30 inch", visualKeyword: "round oak coffee table", imageUrl: null },
  { id: "mw_co_2", name: "Travertine-top coffee table with brass legs, 40 inch", category: "coffee_table", styleTags: ["minimalist_warm"], priceINR: 8499, description: "Natural travertine stone top on antique-brass finish legs.", amazonSearchQuery: "travertine top coffee table brass legs 40 inch", visualKeyword: "travertine brass coffee table", imageUrl: null },
  { id: "mw_co_3", name: "Solid mango wood coffee table with brass inlay, 48 inch", category: "coffee_table", styleTags: ["minimalist_warm"], priceINR: 13999, description: "Solid mango wood top with geometric brass inlay and turned legs.", amazonSearchQuery: "solid mango wood coffee table brass inlay 48 inch", visualKeyword: "mango wood brass-inlay table", imageUrl: null },

  { id: "mw_si_1", name: "Oak wood round side table, 20 inch", category: "side_table", styleTags: ["minimalist_warm"], priceINR: 2299, description: "Round oak-veneer side table with slim tripod base.", amazonSearchQuery: "oak wood round side table 20 inch", visualKeyword: "oak round side table", imageUrl: null },
  { id: "mw_si_2", name: "Brass side table with marble top, 16 inch", category: "side_table", styleTags: ["minimalist_warm"], priceINR: 3799, description: "Antique-brass finish frame with white marble top.", amazonSearchQuery: "brass side table marble top 16 inch", visualKeyword: "marble brass side table", imageUrl: null },
  { id: "mw_si_3", name: "Travertine-top side table with brass base", category: "side_table", styleTags: ["minimalist_warm"], priceINR: 5299, description: "Natural travertine stone disc top on a sculptural brass pedestal.", amazonSearchQuery: "travertine side table brass base", visualKeyword: "travertine brass side table", imageUrl: null },

  { id: "mw_fl_1", name: "Brass arc floor lamp with linen shade, 65 inch", category: "floor_lamp", styleTags: ["minimalist_warm"], priceINR: 2099, description: "Slim arc arm in antique brass with warm linen drum shade.", amazonSearchQuery: "brass arc floor lamp linen shade 65 inch", visualKeyword: "brass arc linen lamp", imageUrl: null },
  { id: "mw_fl_2", name: "Brass tripod floor lamp with cream linen shade", category: "floor_lamp", styleTags: ["minimalist_warm"], priceINR: 3499, description: "Three-leg tripod in brushed brass with tapered cream linen shade.", amazonSearchQuery: "brass tripod floor lamp cream linen shade", visualKeyword: "brass tripod linen lamp", imageUrl: null },
  { id: "mw_fl_3", name: "Sculptural brass floor lamp with fluted glass shade", category: "floor_lamp", styleTags: ["minimalist_warm"], priceINR: 4999, description: "Curved sculptural brass arm with amber-fluted glass globe shade.", amazonSearchQuery: "sculptural brass floor lamp fluted glass shade", visualKeyword: "sculptural brass fluted lamp", imageUrl: null },

  { id: "mw_wa_1", name: "Beige minimal line-art framed print, 24x36 cm", category: "wall_art", styleTags: ["minimalist_warm"], priceINR: 999, description: "Single continuous line figure on beige paper, slim walnut-finish frame.", amazonSearchQuery: "beige minimal line art framed print 24x36 cm", visualKeyword: "beige minimal line art", imageUrl: null },
  { id: "mw_wa_2", name: "Abstract neutral canvas print, 36x24 inch", category: "wall_art", styleTags: ["minimalist_warm"], priceINR: 1899, description: "Warm-neutral abstract brushwork on stretched canvas, gallery wrap.", amazonSearchQuery: "abstract neutral canvas print 36x24 inch", visualKeyword: "neutral abstract canvas art", imageUrl: null },
  { id: "mw_wa_3", name: "Large Japandi abstract canvas, 48x32 inch, walnut frame", category: "wall_art", styleTags: ["minimalist_warm"], priceINR: 3199, description: "Japandi-style large abstract on stretched canvas with solid walnut float frame.", amazonSearchQuery: "large japandi abstract canvas 48x32 inch walnut frame", visualKeyword: "japandi neutral canvas art", imageUrl: null },

  { id: "mw_pl_1", name: "Terracotta planter with saucer, 12 inch", category: "planter", styleTags: ["minimalist_warm"], priceINR: 599, description: "Unglazed terracotta pot with matching saucer. Drainage hole.", amazonSearchQuery: "terracotta planter with saucer 12 inch", visualKeyword: "terracotta planter", imageUrl: null },
  { id: "mw_pl_2", name: "Cream ceramic planter with woven jute basket, 14 inch", category: "planter", styleTags: ["minimalist_warm"], priceINR: 1299, description: "Cream ceramic pot nested inside a woven jute basket. Indoor-friendly.", amazonSearchQuery: "cream ceramic planter jute basket 14 inch", visualKeyword: "cream ceramic jute planter", imageUrl: null },
  { id: "mw_pl_3", name: "Large terracotta floor planter for palm plants, 18 inch", category: "planter", styleTags: ["minimalist_warm"], priceINR: 2199, description: "Heavy terracotta floor planter sized for areca palm or kentia.", amazonSearchQuery: "large terracotta floor planter palm plant 18 inch", visualKeyword: "large terracotta floor planter", imageUrl: null },

  { id: "mw_cw_1", name: "Ivory linen curtain, set of 2, 54x90 inch, rod-pocket", category: "curtain_or_throw", styleTags: ["minimalist_warm"], priceINR: 799, description: "Semi-sheer ivory linen curtains, pair. Diffuses warm daylight.", amazonSearchQuery: "ivory linen curtain set of 2 54x90 rod pocket", visualKeyword: "ivory linen curtains", imageUrl: null },
  { id: "mw_cw_2", name: "Cream cotton waffle-weave throw blanket, 50x60 inch", category: "curtain_or_throw", styleTags: ["minimalist_warm"], priceINR: 1399, description: "Soft waffle-weave cotton throw, machine washable.", amazonSearchQuery: "cream cotton waffle weave throw blanket 50x60 inch", visualKeyword: "cream waffle cotton throw", imageUrl: null },
  { id: "mw_cw_3", name: "Oatmeal wool throw with fringe, 60x70 inch", category: "curtain_or_throw", styleTags: ["minimalist_warm"], priceINR: 2199, description: "Chunky oatmeal wool throw with hand-knotted fringe.", amazonSearchQuery: "oatmeal wool throw blanket with fringe 60x70 inch", visualKeyword: "oatmeal fringed wool throw", imageUrl: null },

  // ---- Boho India ----
  { id: "bi_cu_1", name: "Jaipur block-print cotton cushion covers, set of 4, 40x40cm, mustard & terracotta", category: "cushion_cover", styleTags: ["boho_india"], priceINR: 799, description: "Hand-block printed cotton covers in mustard and terracotta motifs. Concealed zip.", amazonSearchQuery: "jaipur block print cotton cushion covers set of 4 40x40 mustard terracotta", visualKeyword: "block-print mustard cushions", imageUrl: null },
  { id: "bi_cu_2", name: "Velvet cushion covers, set of 4, jewel tones, 45x45cm", category: "cushion_cover", styleTags: ["boho_india"], priceINR: 1299, description: "Luxe velvet in emerald, ruby, sapphire, amber. Brass-tone piping.", amazonSearchQuery: "velvet cushion covers set of 4 jewel tones 45x45 cm", visualKeyword: "emerald velvet cushions", imageUrl: null },
  { id: "bi_cu_3", name: "Kantha-stitch cushion covers, set of 2, 50x50cm, mixed prints", category: "cushion_cover", styleTags: ["boho_india"], priceINR: 1899, description: "Hand-Kantha stitched cotton covers, reclaimed-sari aesthetic.", amazonSearchQuery: "kantha stitch cushion covers set of 2 50x50 mixed prints", visualKeyword: "kantha cotton cushions", imageUrl: null },

  { id: "bi_ru_1", name: "Jaipur block-print cotton dhurrie rug, 4x6 ft, red & indigo", category: "rug", styleTags: ["boho_india"], priceINR: 2699, description: "Hand-block printed cotton dhurrie, natural cotton base.", amazonSearchQuery: "jaipur block print cotton dhurrie 4x6 red indigo", visualKeyword: "block-print red dhurrie rug", imageUrl: null },
  { id: "bi_ru_2", name: "Persian-style area rug, 5x7 ft, deep red & indigo medallion", category: "rug", styleTags: ["boho_india"], priceINR: 4999, description: "Machine-woven Persian-inspired medallion rug in rich red and indigo.", amazonSearchQuery: "persian style area rug 5x7 feet deep red indigo medallion", visualKeyword: "red indigo persian rug", imageUrl: null },
  { id: "bi_ru_3", name: "Handwoven wool-silk Jaipuri rug, 6x9 ft, jewel tones", category: "rug", styleTags: ["boho_india"], priceINR: 7699, description: "Hand-knotted wool and silk blend from Jaipur weavers. Rich jewel-tone palette.", amazonSearchQuery: "handwoven wool silk jaipuri rug 6x9 feet jewel tones", visualKeyword: "jewel-tone wool-silk rug", imageUrl: null },

  { id: "bi_so_budget", name: "Compact 3-seater fabric sofa, mustard cotton upholstery, mango-wood legs, 68 inch", category: "sofa", styleTags: ["boho_india"], priceINR: 13999, description: "Budget-friendly 3-seater in mustard cotton on mango-wood legs. Pair with jewel-tone cushions for instant boho.", amazonSearchQuery: "compact 3 seater fabric sofa mustard cotton mango wood legs 68 inch", visualKeyword: "mustard fabric mango-wood sofa", imageUrl: null },
  { id: "bi_so_1", name: "Low-slung fabric sofa, 3-seater, cream with jewel cushions, 72 inch", category: "sofa", styleTags: ["boho_india"], priceINR: 17999, description: "Low Indian seating sofa in cream cotton with included jewel-tone velvet cushions.", amazonSearchQuery: "low slung fabric sofa 3 seater cream jewel tone cushions 72 inch", visualKeyword: "cream low jewel-tone sofa", imageUrl: null },
  { id: "bi_so_2", name: "Velvet 3-seater sofa, emerald green with brass feet, 80 inch", category: "sofa", styleTags: ["boho_india"], priceINR: 31999, description: "Plush emerald velvet 3-seater on brass-finish tapered feet.", amazonSearchQuery: "velvet 3 seater sofa emerald green brass feet 80 inch", visualKeyword: "emerald velvet sofa", imageUrl: null },
  { id: "bi_so_3", name: "Tufted Chesterfield sofa in ruby velvet, 78 inch", category: "sofa", styleTags: ["boho_india"], priceINR: 43999, description: "Deep-buttoned Chesterfield sofa upholstered in ruby-red velvet.", amazonSearchQuery: "tufted chesterfield sofa ruby red velvet 78 inch", visualKeyword: "ruby tufted chesterfield sofa", imageUrl: null },

  { id: "bi_ar_1", name: "Peacock rattan accent chair, handwoven", category: "armchair", styleTags: ["boho_india"], priceINR: 6999, description: "Handwoven rattan peacock-silhouette chair. Statement boho piece.", amazonSearchQuery: "peacock rattan accent chair handwoven", visualKeyword: "peacock rattan chair", imageUrl: null },
  { id: "bi_ar_2", name: "Velvet armchair in emerald with brass nail-head trim", category: "armchair", styleTags: ["boho_india"], priceINR: 12499, description: "Emerald velvet armchair with brass nail-head trim and turned legs.", amazonSearchQuery: "velvet armchair emerald brass nail head trim", visualKeyword: "emerald velvet armchair", imageUrl: null },
  { id: "bi_ar_3", name: "Handcrafted wooden accent chair with Kantha upholstery", category: "armchair", styleTags: ["boho_india"], priceINR: 17499, description: "Hand-carved sheesham frame with reclaimed Kantha fabric seat and back.", amazonSearchQuery: "handcrafted wooden accent chair kantha upholstery", visualKeyword: "kantha wood armchair", imageUrl: null },

  { id: "bi_co_1", name: "Mango wood coffee table with brass compass inlay, 36 inch", category: "coffee_table", styleTags: ["boho_india"], priceINR: 5499, description: "Solid mango wood top with brass compass-rose inlay and turned legs.", amazonSearchQuery: "mango wood coffee table brass compass inlay 36 inch", visualKeyword: "mango wood brass table", imageUrl: null },
  { id: "bi_co_2", name: "Hexagonal brass coffee table with mirrored top", category: "coffee_table", styleTags: ["boho_india"], priceINR: 8999, description: "Hexagonal antique-brass frame with antiqued mirror top.", amazonSearchQuery: "hexagonal brass coffee table mirrored top", visualKeyword: "hexagonal brass mirror table", imageUrl: null },
  { id: "bi_co_3", name: "Hand-carved solid wood coffee table, Jodhpuri style, 48 inch", category: "coffee_table", styleTags: ["boho_india"], priceINR: 14499, description: "Hand-carved sheesham wood coffee table with Jodhpuri lattice panels.", amazonSearchQuery: "hand carved solid wood coffee table jodhpuri 48 inch", visualKeyword: "carved jodhpuri wood table", imageUrl: null },

  { id: "bi_si_1", name: "Rajasthani painted wooden side table, 16 inch", category: "side_table", styleTags: ["boho_india"], priceINR: 2499, description: "Hand-painted Rajasthani folk motifs on mango wood. Square top.", amazonSearchQuery: "rajasthani painted wooden side table 16 inch", visualKeyword: "painted rajasthani side table", imageUrl: null },
  { id: "bi_si_2", name: "Brass-top side table with hand-hammered base, 18 inch", category: "side_table", styleTags: ["boho_india"], priceINR: 3899, description: "Hand-hammered brass top on a three-legged brass-finish base.", amazonSearchQuery: "brass top side table hand hammered base 18 inch", visualKeyword: "hammered brass side table", imageUrl: null },
  { id: "bi_si_3", name: "Hand-carved teak wood side table with brass inlay", category: "side_table", styleTags: ["boho_india"], priceINR: 5799, description: "Hand-carved teak with geometric brass-wire inlay on all faces.", amazonSearchQuery: "hand carved teak side table brass inlay", visualKeyword: "carved teak brass table", imageUrl: null },

  { id: "bi_fl_1", name: "Hand-woven rattan pendant / floor lamp, 14 inch", category: "floor_lamp", styleTags: ["boho_india"], priceINR: 1899, description: "Handwoven rattan basket shade, usable as pendant or tripod floor lamp.", amazonSearchQuery: "handwoven rattan pendant floor lamp 14 inch", visualKeyword: "woven rattan lamp", imageUrl: null },
  { id: "bi_fl_2", name: "Brass paisley-cut floor lamp with parchment shade", category: "floor_lamp", styleTags: ["boho_india"], priceINR: 3799, description: "Antique-brass column with paisley cutout pattern and parchment drum shade.", amazonSearchQuery: "brass paisley cut floor lamp parchment shade", visualKeyword: "brass paisley parchment lamp", imageUrl: null },
  { id: "bi_fl_3", name: "Moroccan-style pierced brass floor lamp", category: "floor_lamp", styleTags: ["boho_india"], priceINR: 5299, description: "Tall Moroccan-inspired pierced-brass lantern floor lamp.", amazonSearchQuery: "moroccan pierced brass floor lamp tall", visualKeyword: "moroccan pierced brass lamp", imageUrl: null },

  { id: "bi_wa_1", name: "Brass peacock wall hanging, handcrafted, 18 inch", category: "wall_art", styleTags: ["boho_india"], priceINR: 1199, description: "Handcrafted brass peacock, wall-mounted. Statement boho piece.", amazonSearchQuery: "brass peacock wall hanging handcrafted 18 inch", visualKeyword: "brass peacock wall art", imageUrl: null },
  { id: "bi_wa_2", name: "Madhubani folk-art framed print, 24x36 inch", category: "wall_art", styleTags: ["boho_india"], priceINR: 2199, description: "Authentic Madhubani folk-art print, framed in dark wood.", amazonSearchQuery: "madhubani folk art framed print 24x36 inch", visualKeyword: "madhubani folk art", imageUrl: null },
  { id: "bi_wa_3", name: "Large handcrafted Dhokra brass wall mural, 36 inch", category: "wall_art", styleTags: ["boho_india"], priceINR: 3299, description: "Tribal-craft Dhokra brass wall mural, hand-cast by Bastar artisans.", amazonSearchQuery: "large handcrafted dhokra brass wall mural 36 inch", visualKeyword: "dhokra brass wall art", imageUrl: null },

  { id: "bi_pl_1", name: "Hand-painted ceramic planter, Jaipur pottery style, 8 inch", category: "planter", styleTags: ["boho_india"], priceINR: 699, description: "Blue-pottery-inspired hand-painted ceramic planter with drainage.", amazonSearchQuery: "hand painted ceramic planter jaipur blue pottery 8 inch", visualKeyword: "jaipur blue ceramic planter", imageUrl: null },
  { id: "bi_pl_2", name: "Hand-painted ceramic planter set of 2, Madhubani motifs", category: "planter", styleTags: ["boho_india"], priceINR: 1399, description: "Pair of 6-inch and 8-inch hand-painted Madhubani ceramic planters.", amazonSearchQuery: "hand painted ceramic planter set of 2 madhubani", visualKeyword: "madhubani ceramic planters", imageUrl: null },
  { id: "bi_pl_3", name: "Large Dhokra-style brass planter, 14 inch, hand-hammered", category: "planter", styleTags: ["boho_india"], priceINR: 2399, description: "Hand-hammered brass floor planter in Dhokra tradition. Holds money plant or monstera.", amazonSearchQuery: "dhokra brass floor planter 14 inch hand hammered", visualKeyword: "dhokra brass floor planter", imageUrl: null },

  { id: "bi_cw_1", name: "Mirrored Rajasthani curtain panel, maroon, 54x90 inch", category: "curtain_or_throw", styleTags: ["boho_india"], priceINR: 899, description: "Single panel mirrored Gujarati embroidery curtain in deep maroon.", amazonSearchQuery: "mirrored rajasthani curtain panel maroon 54x90", visualKeyword: "mirrored maroon curtain", imageUrl: null },
  { id: "bi_cw_2", name: "Kantha-stitch cotton throw, jewel tones, 60x80 inch", category: "curtain_or_throw", styleTags: ["boho_india"], priceINR: 1599, description: "Reversible Kantha throw in jewel-tone reclaimed sari fabric.", amazonSearchQuery: "kantha stitch cotton throw jewel tones 60x80 inch", visualKeyword: "jewel-tone kantha throw", imageUrl: null },
  { id: "bi_cw_3", name: "Mirrored Gujarati wall-tapestry throw, 60x90 inch", category: "curtain_or_throw", styleTags: ["boho_india"], priceINR: 2399, description: "Hand-embroidered Gujarati mirror-work tapestry, usable as throw or wall hanging.", amazonSearchQuery: "mirrored gujarati wall tapestry throw 60x90 inch", visualKeyword: "mirrored gujarati tapestry", imageUrl: null },

  // ---- Indian Contemporary ----
  { id: "ic_cu_1", name: "Mustard & terracotta cushion covers, set of 4, 40x40cm", category: "cushion_cover", styleTags: ["indian_contemporary"], priceINR: 749, description: "Mix of mustard and terracotta solid cotton covers with brass-tone zip.", amazonSearchQuery: "mustard terracotta cushion covers set of 4 40x40", visualKeyword: "mustard terracotta cushions", imageUrl: null },
  { id: "ic_cu_2", name: "Kutch embroidered cushion covers, set of 2, teal & mustard, 45x45cm", category: "cushion_cover", styleTags: ["indian_contemporary"], priceINR: 1299, description: "Hand-embroidered Kutch-style mirror work on teal and mustard cotton.", amazonSearchQuery: "kutch embroidered cushion covers set of 2 teal mustard 45x45", visualKeyword: "teal kutch cushions", imageUrl: null },
  { id: "ic_cu_3", name: "Silk-blend cushion covers, set of 4, jewel-tone abstract, 50x50cm", category: "cushion_cover", styleTags: ["indian_contemporary"], priceINR: 1699, description: "Sheen silk-blend covers with modern jewel-tone abstract print.", amazonSearchQuery: "silk blend cushion covers set of 4 jewel tone abstract 50x50", visualKeyword: "jewel-tone silk cushions", imageUrl: null },

  { id: "ic_ru_1", name: "Geometric cotton dhurrie rug, 4x6 ft, teal & mustard", category: "rug", styleTags: ["indian_contemporary"], priceINR: 2899, description: "Handwoven geometric dhurrie in teal and mustard stripes.", amazonSearchQuery: "geometric cotton dhurrie rug 4x6 teal mustard", visualKeyword: "teal mustard dhurrie rug", imageUrl: null },
  { id: "ic_ru_2", name: "Wool area rug with Kutch-inspired motifs, 5x7 ft", category: "rug", styleTags: ["indian_contemporary"], priceINR: 4799, description: "Kutch-inspired geometric motif on cream wool ground.", amazonSearchQuery: "wool area rug kutch motifs 5x7 feet", visualKeyword: "cream kutch wool rug", imageUrl: null },
  { id: "ic_ru_3", name: "Hand-tufted wool-silk Indian contemporary rug, 6x9 ft", category: "rug", styleTags: ["indian_contemporary"], priceINR: 7299, description: "Hand-tufted wool-silk blend with contemporary Indian motifs.", amazonSearchQuery: "hand tufted wool silk indian contemporary rug 6x9", visualKeyword: "wool-silk contemporary rug", imageUrl: null },

  { id: "ic_so_budget", name: "Compact 3-seater fabric sofa, terracotta cotton upholstery, sheesham-finish legs, 68 inch", category: "sofa", styleTags: ["indian_contemporary"], priceINR: 13999, description: "Budget-friendly 3-seater in terracotta cotton on sheesham-finish legs. Pairs with Kutch cushions.", amazonSearchQuery: "compact 3 seater fabric sofa terracotta cotton sheesham legs 68 inch", visualKeyword: "terracotta cotton sheesham sofa", imageUrl: null },
  { id: "ic_so_1", name: "Low wooden-frame 3-seater sofa with mustard cushions, 72 inch", category: "sofa", styleTags: ["indian_contemporary"], priceINR: 18499, description: "Exposed sheesham frame with mustard-cotton seat and back cushions.", amazonSearchQuery: "low wooden frame 3 seater sofa mustard cushions 72 inch", visualKeyword: "sheesham mustard sofa", imageUrl: null },
  { id: "ic_so_2", name: "Mid-century Indian 3-seater sofa in terracotta velvet", category: "sofa", styleTags: ["indian_contemporary"], priceINR: 29999, description: "Mid-century silhouette sofa in terracotta velvet with sheesham tapered legs.", amazonSearchQuery: "mid century 3 seater sofa terracotta velvet sheesham legs", visualKeyword: "terracotta velvet sofa", imageUrl: null },
  { id: "ic_so_3", name: "Designer sheesham wood 3-seater with Kutch upholstery, 84 inch", category: "sofa", styleTags: ["indian_contemporary"], priceINR: 41999, description: "Solid sheesham frame with full Kutch-embroidered cotton upholstery.", amazonSearchQuery: "designer sheesham wood 3 seater kutch upholstery 84 inch", visualKeyword: "sheesham kutch sofa", imageUrl: null },

  { id: "ic_ar_1", name: "Rattan-back accent armchair with mustard cushion", category: "armchair", styleTags: ["indian_contemporary"], priceINR: 7299, description: "Rattan woven back with solid teak frame and mustard cotton seat.", amazonSearchQuery: "rattan back accent armchair mustard cushion", visualKeyword: "rattan mustard armchair", imageUrl: null },
  { id: "ic_ar_2", name: "Mid-century teak armchair with terracotta bouclé", category: "armchair", styleTags: ["indian_contemporary"], priceINR: 11499, description: "Mid-century teak armchair upholstered in terracotta bouclé.", amazonSearchQuery: "mid century teak armchair terracotta boucle", visualKeyword: "terracotta teak armchair", imageUrl: null },
  { id: "ic_ar_3", name: "Solid sheesham armchair with hand-embroidered Kutch panels", category: "armchair", styleTags: ["indian_contemporary"], priceINR: 15999, description: "Sheesham frame with hand-embroidered Kutch back and seat panels.", amazonSearchQuery: "solid sheesham armchair hand embroidered kutch panels", visualKeyword: "sheesham kutch armchair", imageUrl: null },

  { id: "ic_co_1", name: "Mango wood coffee table with geometric brass inlay, 36 inch", category: "coffee_table", styleTags: ["indian_contemporary"], priceINR: 5299, description: "Mango wood top with modern geometric brass inlay.", amazonSearchQuery: "mango wood coffee table geometric brass inlay 36 inch", visualKeyword: "mango brass geometric table", imageUrl: null },
  { id: "ic_co_2", name: "Brass-top coffee table with sheesham legs, 40 inch", category: "coffee_table", styleTags: ["indian_contemporary"], priceINR: 8799, description: "Hammered brass top on solid sheesham tapered legs.", amazonSearchQuery: "brass top coffee table sheesham legs 40 inch", visualKeyword: "brass sheesham coffee table", imageUrl: null },
  { id: "ic_co_3", name: "Marble-top coffee table with cast-brass trefoil base", category: "coffee_table", styleTags: ["indian_contemporary"], priceINR: 13499, description: "White marble top on sculptural cast-brass trefoil base.", amazonSearchQuery: "marble top coffee table cast brass trefoil base", visualKeyword: "marble brass coffee table", imageUrl: null },

  { id: "ic_si_1", name: "Sheesham wood side table with brass inlay, 18 inch", category: "side_table", styleTags: ["indian_contemporary"], priceINR: 2699, description: "Solid sheesham with thin-line brass inlay on a tapered base.", amazonSearchQuery: "sheesham wood side table brass inlay 18 inch", visualKeyword: "sheesham brass side table", imageUrl: null },
  { id: "ic_si_2", name: "Brass drum side table with hammered finish", category: "side_table", styleTags: ["indian_contemporary"], priceINR: 3499, description: "Hand-hammered antique brass drum-silhouette side table.", amazonSearchQuery: "brass drum side table hammered finish", visualKeyword: "hammered brass drum table", imageUrl: null },
  { id: "ic_si_3", name: "Marble and brass nested side tables, set of 2", category: "side_table", styleTags: ["indian_contemporary"], priceINR: 5599, description: "Pair of nested tables: large marble-top and small brass-top.", amazonSearchQuery: "marble brass nested side tables set of 2", visualKeyword: "marble brass nested tables", imageUrl: null },

  { id: "ic_fl_1", name: "Brass tripod floor lamp with rice-paper shade", category: "floor_lamp", styleTags: ["indian_contemporary"], priceINR: 2299, description: "Brushed brass tripod with handmade rice-paper drum shade.", amazonSearchQuery: "brass tripod floor lamp rice paper shade", visualKeyword: "brass tripod rice-paper lamp", imageUrl: null },
  { id: "ic_fl_2", name: "Contemporary brass arc floor lamp with fluted shade", category: "floor_lamp", styleTags: ["indian_contemporary"], priceINR: 3399, description: "Elegant arc in antique brass with fluted amber-glass shade.", amazonSearchQuery: "contemporary brass arc floor lamp fluted shade", visualKeyword: "brass arc fluted lamp", imageUrl: null },
  { id: "ic_fl_3", name: "Brass and teak sculptural floor lamp with pleated shade", category: "floor_lamp", styleTags: ["indian_contemporary"], priceINR: 4899, description: "Sculptural brass-and-teak column with pleated linen shade.", amazonSearchQuery: "brass teak sculptural floor lamp pleated linen shade", visualKeyword: "brass teak pleated lamp", imageUrl: null },

  { id: "ic_wa_1", name: "Madhubani-inspired framed wall art, 24x36 inch", category: "wall_art", styleTags: ["indian_contemporary"], priceINR: 1099, description: "Modern take on Madhubani motifs, framed print in warm walnut.", amazonSearchQuery: "madhubani inspired framed wall art 24x36 inch", visualKeyword: "madhubani framed art", imageUrl: null },
  { id: "ic_wa_2", name: "Framed Kutch embroidery wall hanging, 24x36 inch", category: "wall_art", styleTags: ["indian_contemporary"], priceINR: 2299, description: "Authentic Kutch embroidery framed behind museum glass.", amazonSearchQuery: "framed kutch embroidery wall hanging 24x36 inch", visualKeyword: "framed kutch embroidery", imageUrl: null },
  { id: "ic_wa_3", name: "Large Warli-inspired handwoven tapestry, 36x48 inch", category: "wall_art", styleTags: ["indian_contemporary"], priceINR: 3299, description: "Hand-woven tapestry featuring Warli tribal motifs. Rod-pocket hang.", amazonSearchQuery: "warli tribal handwoven tapestry 36x48 inch", visualKeyword: "warli handwoven tapestry", imageUrl: null },

  { id: "ic_pl_1", name: "Antique brass-finish planter, 8 inch", category: "planter", styleTags: ["indian_contemporary"], priceINR: 649, description: "Cast antique brass-finish planter with subtle hammered texture.", amazonSearchQuery: "antique brass finish planter 8 inch hammered", visualKeyword: "antique brass planter", imageUrl: null },
  { id: "ic_pl_2", name: "Hammered brass planter with stand, 12 inch", category: "planter", styleTags: ["indian_contemporary"], priceINR: 1299, description: "Hammered antique-brass planter with matching 18-inch tripod stand.", amazonSearchQuery: "hammered brass planter with stand 12 inch", visualKeyword: "hammered brass stand planter", imageUrl: null },
  { id: "ic_pl_3", name: "Large brass-finish floor planter for monstera, 16 inch", category: "planter", styleTags: ["indian_contemporary"], priceINR: 2299, description: "Large brass-finish floor planter sized for monstera or bird-of-paradise.", amazonSearchQuery: "large brass finish floor planter monstera 16 inch", visualKeyword: "brass monstera floor planter", imageUrl: null },

  { id: "ic_cw_1", name: "Mustard cotton-linen curtains, set of 2, 54x90 inch", category: "curtain_or_throw", styleTags: ["indian_contemporary"], priceINR: 849, description: "Cotton-linen blend curtains in warm mustard with rod pocket.", amazonSearchQuery: "mustard cotton linen curtains set of 2 54x90 inch", visualKeyword: "mustard cotton-linen curtains", imageUrl: null },
  { id: "ic_cw_2", name: "Kutch-embroidered throw blanket, mustard & teal, 50x70 inch", category: "curtain_or_throw", styleTags: ["indian_contemporary"], priceINR: 1499, description: "Mustard-and-teal throw with hand-embroidered Kutch-style mirror work.", amazonSearchQuery: "kutch embroidered throw blanket mustard teal 50x70 inch", visualKeyword: "kutch mustard teal throw", imageUrl: null },
  { id: "ic_cw_3", name: "Handloom cotton-silk throw with Kalamkari motifs, 60x80 inch", category: "curtain_or_throw", styleTags: ["indian_contemporary"], priceINR: 2299, description: "Handloom cotton-silk blend throw featuring hand-painted Kalamkari motifs.", amazonSearchQuery: "handloom cotton silk throw kalamkari motifs 60x80 inch", visualKeyword: "kalamkari cotton-silk throw", imageUrl: null },

  // ---- Scandi-Warm Indian ----
  { id: "sw_cu_1", name: "Cream chunky-knit cushion covers, set of 2, 45x45cm", category: "cushion_cover", styleTags: ["scandi_warm_indian"], priceINR: 899, description: "Chunky-knit cream cushion covers with concealed zip.", amazonSearchQuery: "cream chunky knit cushion covers set of 2 45x45", visualKeyword: "cream chunky-knit cushions", imageUrl: null },
  { id: "sw_cu_2", name: "Light gray linen cushion covers with Kutch border, 40x40cm, set of 4", category: "cushion_cover", styleTags: ["scandi_warm_indian"], priceINR: 1399, description: "Light gray linen covers with subtle hand-embroidered Kutch border.", amazonSearchQuery: "light gray linen cushion covers kutch border set of 4 40x40", visualKeyword: "gray linen kutch cushions", imageUrl: null },
  { id: "sw_cu_3", name: "Indigo accent cushion covers, set of 2, block-print hem, 50x50cm", category: "cushion_cover", styleTags: ["scandi_warm_indian"], priceINR: 1799, description: "Off-white cotton covers with hand-block-printed indigo hem.", amazonSearchQuery: "indigo accent cushion covers set of 2 block print hem 50x50", visualKeyword: "indigo block-print cushions", imageUrl: null },

  { id: "sw_ru_1", name: "Cream jute-wool flatweave rug, 4x6 ft", category: "rug", styleTags: ["scandi_warm_indian"], priceINR: 3299, description: "Cream flatweave rug combining jute base and wool loop pile.", amazonSearchQuery: "cream jute wool flatweave rug 4x6 feet", visualKeyword: "cream jute-wool rug", imageUrl: null },
  { id: "sw_ru_2", name: "Cream wool rug with subtle Kutch pattern, 5x7 ft", category: "rug", styleTags: ["scandi_warm_indian"], priceINR: 4899, description: "Cream wool rug with tonal low-contrast Kutch-inspired pattern.", amazonSearchQuery: "cream wool rug subtle kutch pattern 5x7 feet", visualKeyword: "cream kutch wool rug", imageUrl: null },
  { id: "sw_ru_3", name: "Handloom wool-cotton area rug, 6x9 ft, cream w/ indigo accent", category: "rug", styleTags: ["scandi_warm_indian"], priceINR: 7499, description: "Handloom wool-cotton rug in cream with a single indigo stripe.", amazonSearchQuery: "handloom wool cotton area rug 6x9 cream indigo accent", visualKeyword: "cream indigo wool rug", imageUrl: null },

  { id: "sw_so_budget", name: "Compact 3-seater fabric sofa, light gray polyester blend, teak-finish legs, 68 inch", category: "sofa", styleTags: ["scandi_warm_indian"], priceINR: 13999, description: "Budget-friendly 3-seater in light gray polyester blend on teak-finish legs. Clean Scandi silhouette.", amazonSearchQuery: "compact 3 seater fabric sofa light gray polyester teak legs 68 inch", visualKeyword: "gray fabric teak-leg sofa", imageUrl: null },
  { id: "sw_so_1", name: "Light gray linen 3-seater sofa with teak legs, 72 inch", category: "sofa", styleTags: ["scandi_warm_indian"], priceINR: 19999, description: "Slim-profile light-gray linen sofa on solid teak legs.", amazonSearchQuery: "light gray linen 3 seater sofa teak legs 72 inch", visualKeyword: "gray linen teak sofa", imageUrl: null },
  { id: "sw_so_2", name: "Cream linen 3-seater sofa with teak trim, 78 inch", category: "sofa", styleTags: ["scandi_warm_indian"], priceINR: 31499, description: "Cream linen 3-seater with exposed teak trim along the top rail.", amazonSearchQuery: "cream linen 3 seater sofa teak trim 78 inch", visualKeyword: "cream linen teak sofa", imageUrl: null },
  { id: "sw_so_3", name: "Ivory bouclé 3-seater sofa with Kutch accent cushions, 84 inch", category: "sofa", styleTags: ["scandi_warm_indian"], priceINR: 42499, description: "Ivory bouclé 3-seater sofa with included Kutch-embroidered accent cushions.", amazonSearchQuery: "ivory boucle 3 seater sofa kutch accent cushions 84 inch", visualKeyword: "ivory bouclé sofa", imageUrl: null },

  { id: "sw_ar_1", name: "Teak-frame accent armchair in light gray linen", category: "armchair", styleTags: ["scandi_warm_indian"], priceINR: 7499, description: "Solid teak accent chair with light gray linen upholstery.", amazonSearchQuery: "teak frame accent armchair light gray linen", visualKeyword: "gray linen teak armchair", imageUrl: null },
  { id: "sw_ar_2", name: "Bouclé swivel armchair with teak base, cream", category: "armchair", styleTags: ["scandi_warm_indian"], priceINR: 11999, description: "Cream bouclé swivel chair on a solid-teak disc base.", amazonSearchQuery: "boucle swivel armchair teak base cream", visualKeyword: "cream bouclé teak armchair", imageUrl: null },
  { id: "sw_ar_3", name: "Sculptural solid-teak lounge chair with wool cushion", category: "armchair", styleTags: ["scandi_warm_indian"], priceINR: 17499, description: "Sculptural solid-teak lounge chair with removable wool seat cushion.", amazonSearchQuery: "sculptural solid teak lounge chair wool cushion", visualKeyword: "teak wool lounge chair", imageUrl: null },

  { id: "sw_co_1", name: "Teak round coffee table, 30 inch", category: "coffee_table", styleTags: ["scandi_warm_indian"], priceINR: 4799, description: "Solid teak round coffee table with clean minimalist silhouette.", amazonSearchQuery: "teak round coffee table 30 inch minimalist", visualKeyword: "teak round coffee table", imageUrl: null },
  { id: "sw_co_2", name: "Teak wood coffee table with brass inlay, 40 inch", category: "coffee_table", styleTags: ["scandi_warm_indian"], priceINR: 8299, description: "Solid teak top with thin linear brass inlay.", amazonSearchQuery: "teak wood coffee table brass inlay 40 inch", visualKeyword: "teak brass coffee table", imageUrl: null },
  { id: "sw_co_3", name: "Minimalist solid-teak coffee table with sculpted legs, 48 inch", category: "coffee_table", styleTags: ["scandi_warm_indian"], priceINR: 13999, description: "Solid teak top on sculpted tapered legs. Scandi-Indian minimalist.", amazonSearchQuery: "minimalist solid teak coffee table sculpted legs 48 inch", visualKeyword: "teak sculpted coffee table", imageUrl: null },

  { id: "sw_si_1", name: "Teak wood side table, 20 inch", category: "side_table", styleTags: ["scandi_warm_indian"], priceINR: 2399, description: "Solid teak minimalist round side table with tapered legs.", amazonSearchQuery: "teak wood side table 20 inch minimalist", visualKeyword: "teak side table", imageUrl: null },
  { id: "sw_si_2", name: "Teak side table with brass inlay, 16 inch", category: "side_table", styleTags: ["scandi_warm_indian"], priceINR: 3699, description: "Teak-top side table with hairline brass inlay around the perimeter.", amazonSearchQuery: "teak side table brass inlay 16 inch", visualKeyword: "teak brass side table", imageUrl: null },
  { id: "sw_si_3", name: "Teak nested side tables, set of 2, with brass trim", category: "side_table", styleTags: ["scandi_warm_indian"], priceINR: 5499, description: "Pair of nested teak tables with brass-wrapped edges.", amazonSearchQuery: "teak nested side tables set of 2 brass trim", visualKeyword: "teak brass nested tables", imageUrl: null },

  { id: "sw_fl_1", name: "Minimal matte black metal floor lamp with teak base", category: "floor_lamp", styleTags: ["scandi_warm_indian"], priceINR: 2099, description: "Matte black metal pole on a solid teak base. Adjustable cone shade.", amazonSearchQuery: "minimal matte black metal floor lamp teak base", visualKeyword: "black metal teak lamp", imageUrl: null },
  { id: "sw_fl_2", name: "Teak floor lamp with linen pleated shade", category: "floor_lamp", styleTags: ["scandi_warm_indian"], priceINR: 3299, description: "Solid teak column with natural-linen pleated drum shade.", amazonSearchQuery: "teak floor lamp linen pleated shade", visualKeyword: "teak linen pleated lamp", imageUrl: null },
  { id: "sw_fl_3", name: "Sculptural teak floor lamp with fluted brass accents", category: "floor_lamp", styleTags: ["scandi_warm_indian"], priceINR: 4799, description: "Sculpted teak column with fluted brass ring accents.", amazonSearchQuery: "sculptural teak floor lamp fluted brass accents", visualKeyword: "teak brass sculptural lamp", imageUrl: null },

  { id: "sw_wa_1", name: "Indigo block-print framed wall art, 24x36 inch", category: "wall_art", styleTags: ["scandi_warm_indian"], priceINR: 1099, description: "Hand-block-printed indigo on cream cotton, framed in light teak.", amazonSearchQuery: "indigo block print framed wall art 24x36 inch", visualKeyword: "indigo block-print art", imageUrl: null },
  { id: "sw_wa_2", name: "Scandi-Indian line-art framed triptych, 3x (18x24) inch", category: "wall_art", styleTags: ["scandi_warm_indian"], priceINR: 1899, description: "Three-piece line-art triptych in warm neutrals, matching frames.", amazonSearchQuery: "scandi indian line art framed triptych 18x24 inch", visualKeyword: "scandi line-art triptych", imageUrl: null },
  { id: "sw_wa_3", name: "Large mixed-media Kutch-motif framed art, 36x48 inch", category: "wall_art", styleTags: ["scandi_warm_indian"], priceINR: 2899, description: "Large mixed-media canvas combining Scandi minimalism with Kutch motifs.", amazonSearchQuery: "mixed media kutch motif framed art 36x48 inch", visualKeyword: "kutch mixed-media art", imageUrl: null },

  { id: "sw_pl_1", name: "White ceramic planter with teak stand, 10 inch", category: "planter", styleTags: ["scandi_warm_indian"], priceINR: 749, description: "Matte white ceramic planter on a 14-inch teak tripod stand.", amazonSearchQuery: "white ceramic planter teak stand 10 inch", visualKeyword: "white ceramic teak planter", imageUrl: null },
  { id: "sw_pl_2", name: "Matte ceramic planter set of 2 with teak stand, 12 inch", category: "planter", styleTags: ["scandi_warm_indian"], priceINR: 1299, description: "Pair of matte-finish ceramic planters on matching teak stands.", amazonSearchQuery: "matte ceramic planter set of 2 teak stand 12 inch", visualKeyword: "matte ceramic teak planters", imageUrl: null },
  { id: "sw_pl_3", name: "Large matte-white floor planter with subtle Kutch pattern", category: "planter", styleTags: ["scandi_warm_indian"], priceINR: 2199, description: "Oversized matte-white floor planter with tonal Kutch-pattern detail.", amazonSearchQuery: "large matte white floor planter kutch pattern", visualKeyword: "matte-white kutch floor planter", imageUrl: null },

  { id: "sw_cw_1", name: "Off-white linen curtains, set of 2, 54x90 inch", category: "curtain_or_throw", styleTags: ["scandi_warm_indian"], priceINR: 799, description: "Off-white linen curtains for soft diffused daylight. Rod pocket.", amazonSearchQuery: "off white linen curtains set of 2 54x90 inch", visualKeyword: "off-white linen curtains", imageUrl: null },
  { id: "sw_cw_2", name: "Cream wool-blend throw with indigo tassels, 50x60 inch", category: "curtain_or_throw", styleTags: ["scandi_warm_indian"], priceINR: 1499, description: "Soft cream wool-blend throw blanket with hand-tied indigo tassels.", amazonSearchQuery: "cream wool blend throw indigo tassels 50x60 inch", visualKeyword: "cream wool indigo throw", imageUrl: null },
  { id: "sw_cw_3", name: "Handloom wool throw with subtle Kutch motif, 60x80 inch", category: "curtain_or_throw", styleTags: ["scandi_warm_indian"], priceINR: 2199, description: "Handloom wool throw in cream with low-contrast Kutch-inspired motif.", amazonSearchQuery: "handloom wool throw subtle kutch motif 60x80 inch", visualKeyword: "cream kutch wool throw", imageUrl: null },
];

// ---- Helpers ----

export function getProductUrl(p: ShopProduct): string {
  return `https://www.amazon.in/s?k=${encodeURIComponent(p.amazonSearchQuery)}`;
}

export function getProductById(id: string): ShopProduct | undefined {
  return SHOP_CATALOG.find((p) => p.id === id);
}

export function getProductsByIds(ids: string[]): ShopProduct[] {
  const map = new Map(SHOP_CATALOG.map((p) => [p.id, p] as const));
  const out: ShopProduct[] = [];
  for (const id of ids) {
    const p = map.get(id);
    if (p) out.push(p);
  }
  return out;
}

export function getProductsByStyleTag(tag: StyleTag): ShopProduct[] {
  return SHOP_CATALOG.filter((p) => p.styleTags.includes(tag));
}

export function getProductsByStyle(style: Style): ShopProduct[] {
  return getProductsByStyleTag(STYLE_TO_TAG[style]);
}

// Legacy helper kept for back-compat with any caller still passing style.
// Gallery now uses selectedProductIds from the render row (Phase 3).
export function getProductsForStyle(style: Style): ShopProduct[] {
  const all = getProductsByStyle(style);
  const priority: ShopCategory[] = [
    "cushion_cover",
    "floor_lamp",
    "rug",
    "wall_art",
    "side_table",
    "planter",
  ];
  const out: ShopProduct[] = [];
  for (const cat of priority) {
    const pick = all.find((p) => p.category === cat);
    if (pick) out.push(pick);
  }
  return out;
}
