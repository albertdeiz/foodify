import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // ─── Cleanup ───────────────────────────────────────────────────────────────
  await prisma.comboItem.deleteMany()
  await prisma.menuProductPrice.deleteMany()
  await prisma.menuCategory.deleteMany()
  await prisma.productCategory.deleteMany()
  await prisma.productProductComplementType.deleteMany()
  await prisma.productComplement.deleteMany()
  await prisma.productComplementType.deleteMany()
  await prisma.product.deleteMany()
  await prisma.menu.deleteMany()
  await prisma.category.deleteMany()
  await prisma.userWorkspace.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  console.log('🧹 DB limpia')

  // ─── Usuario ───────────────────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      first_name: 'Admin',
      last_name: 'Foodify',
      email: 'admin@foodify.com',
      password: await bcrypt.hash('password123', 10),
    },
  })

  // ─── Workspace ─────────────────────────────────────────────────────────────
  const workspace = await prisma.workspace.create({
    data: {
      name: 'BurgerPizza Co.',
      slug: 'burgerpizza-co',
      address: 'Calle Gran Vía 123, Madrid',
      user_workspaces: { create: { user_id: user.id } },
    },
  })

  const wid = workspace.id
  console.log(`✅ Workspace: ${workspace.name}`)

  // ─── Categorías ────────────────────────────────────────────────────────────
  const [
    catBurgers, catPizzas, catSides, catDrinks, catDesserts,
    catCombos, catPromos, catBreakfast, catSalads, catSauces,
  ] = await Promise.all([
    prisma.category.create({ data: { name: 'Hamburguesas', order: 1, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Pizzas', order: 2, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Acompañamientos', order: 3, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Bebidas', order: 4, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Postres', order: 5, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Combos', order: 6, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Promociones', order: 7, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Desayunos', order: 8, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Ensaladas', order: 9, workspace_id: wid } }),
    prisma.category.create({ data: { name: 'Salsas', order: 10, workspace_id: wid } }),
  ])

  console.log('✅ Categorías creadas')

  // ─── Tipos de Complemento ──────────────────────────────────────────────────
  const [
    ctMeat, ctBurgerExtras, ctNoIngredients,
    ctSize, ctPizzaDough, ctPizzaSize, ctPizzaExtras, ctSauces,
    ctChooseBurger, ctChoosePizza, ctChooseDrink, ctChooseSide, ctChooseDessert,
  ] = await Promise.all([
    prisma.productComplementType.create({
      data: { name: 'Tipo de carne', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Extras', required: false, max_selectable: 5, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Sin ingredientes', required: false, max_selectable: 10, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Tamaño', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Tipo de masa', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Tamaño de pizza', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Ingredientes extra', required: false, max_selectable: 5, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Salsas', required: false, max_selectable: 3, workspace_id: wid },
    }),
    // Tipos de elección para slots de combos
    prisma.productComplementType.create({
      data: { name: 'Elige tu hamburguesa', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Elige tu pizza', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Elige tu bebida', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Elige tu acompañamiento', required: true, max_selectable: 1, workspace_id: wid },
    }),
    prisma.productComplementType.create({
      data: { name: 'Elige tu postre', required: true, max_selectable: 1, workspace_id: wid },
    }),
  ])

  // Opciones por tipo de complemento
  await prisma.productComplement.createMany({
    data: [
      // Tipo de carne
      { product_complement_type_id: ctMeat.id, name: 'Vacuno', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctMeat.id, name: 'Doble vacuno', price: 150, increment: true, is_disabled: false },
      { product_complement_type_id: ctMeat.id, name: 'Pollo', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctMeat.id, name: 'Vegetal', price: 0, increment: false, is_disabled: false },

      // Extras hamburguesa
      { product_complement_type_id: ctBurgerExtras.id, name: 'Bacon', price: 100, increment: true, is_disabled: false },
      { product_complement_type_id: ctBurgerExtras.id, name: 'Queso extra', price: 80, increment: true, is_disabled: false },
      { product_complement_type_id: ctBurgerExtras.id, name: 'Huevo frito', price: 100, increment: true, is_disabled: false },
      { product_complement_type_id: ctBurgerExtras.id, name: 'Jalapeños', price: 50, increment: true, is_disabled: false },
      { product_complement_type_id: ctBurgerExtras.id, name: 'Aguacate', price: 150, increment: true, is_disabled: false },
      { product_complement_type_id: ctBurgerExtras.id, name: 'Cebolla caramelizada', price: 80, increment: true, is_disabled: false },

      // Sin ingredientes
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin lechuga', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin tomate', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin cebolla', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin pepinillo', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin salsa', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctNoIngredients.id, name: 'Sin queso', price: 0, increment: false, is_disabled: false },

      // Tamaño (bebidas y acompañamientos)
      { product_complement_type_id: ctSize.id, name: 'Pequeño', price: -50, increment: false, is_disabled: false },
      { product_complement_type_id: ctSize.id, name: 'Mediano', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctSize.id, name: 'Grande', price: 70, increment: true, is_disabled: false },

      // Tipo de masa
      { product_complement_type_id: ctPizzaDough.id, name: 'Masa fina', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctPizzaDough.id, name: 'Masa gruesa', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctPizzaDough.id, name: 'Masa con borde de queso', price: 200, increment: true, is_disabled: false },

      // Tamaño de pizza
      { product_complement_type_id: ctPizzaSize.id, name: 'Individual (25 cm)', price: -200, increment: false, is_disabled: false },
      { product_complement_type_id: ctPizzaSize.id, name: 'Mediana (32 cm)', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctPizzaSize.id, name: 'Familiar (45 cm)', price: 400, increment: true, is_disabled: false },

      // Ingredientes extra pizza
      { product_complement_type_id: ctPizzaExtras.id, name: 'Pepperoni extra', price: 150, increment: true, is_disabled: false },
      { product_complement_type_id: ctPizzaExtras.id, name: 'Champiñones', price: 100, increment: true, is_disabled: false },
      { product_complement_type_id: ctPizzaExtras.id, name: 'Pimientos', price: 100, increment: true, is_disabled: false },
      { product_complement_type_id: ctPizzaExtras.id, name: 'Aceitunas negras', price: 100, increment: true, is_disabled: false },
      { product_complement_type_id: ctPizzaExtras.id, name: 'Rúcula', price: 120, increment: true, is_disabled: false },
      { product_complement_type_id: ctPizzaExtras.id, name: 'Anchoas', price: 130, increment: true, is_disabled: false },

      // Salsas
      { product_complement_type_id: ctSauces.id, name: 'Ketchup', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'Mostaza', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'BBQ', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'Mayonesa', price: 0, increment: false, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'Ranch', price: 50, increment: true, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'Sriracha', price: 50, increment: true, is_disabled: false },
      { product_complement_type_id: ctSauces.id, name: 'Trufa', price: 80, increment: true, is_disabled: false },

    ],
  })
  // Nota: las opciones de "Elige tu X" se crean después de los productos
  // para poder asignar linked_product_id referenciando los IDs reales.

  console.log('✅ Complementos creados')

  // ─── Productos ─────────────────────────────────────────────────────────────

  // Hamburguesas
  const [pBigBurger, pDoubleBacon, pCrispyChicken, pVeggieBurger, pMushBurger] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Big Burger', description: 'Hamburguesa clásica con lechuga, tomate, pepinillo y salsa especial', price: 899, type: 'COMPLEMENTED', content: '280g', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Doble Bacon Burger', description: 'Doble carne con bacon crujiente, queso cheddar y salsa BBQ', price: 1099, type: 'COMPLEMENTED', content: '380g', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Crispy Chicken Burger', description: 'Pechuga de pollo empanada, lechuga iceberg y mayonesa de ajo', price: 849, type: 'COMPLEMENTED', content: '260g', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Veggie Burger', description: 'Hamburguesa vegetal con aguacate, tomate cherry y pesto', price: 799, type: 'COMPLEMENTED', content: '250g', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Mushroom Swiss Burger', description: 'Hamburguesa con champiñones salteados y queso suizo fundido', price: 999, type: 'COMPLEMENTED', content: '300g', workspace_id: wid } }),
    ])

  // Pizzas
  const [pMargherita, pPepperoni, pCuatroQuesos, pBBQChicken, pHawaiana, pDiavola, pVegetariana] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Margherita', description: 'Tomate San Marzano, mozzarella fior di latte y albahaca fresca', price: 899, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Pepperoni Classic', description: 'Tomate, mozzarella y pepperoni artesanal', price: 999, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Cuatro Quesos', description: 'Mozzarella, gorgonzola, parmesano y queso de cabra', price: 1099, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'BBQ Chicken', description: 'Pollo asado, cebolla roja, salsa BBQ y mozzarella', price: 1099, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Hawaiana', description: 'Jamón, piña natural, mozzarella y tomate', price: 999, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Diavola', description: 'Salami picante, nduja, guindilla y mozzarella', price: 1099, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Vegetariana', description: 'Pimientos, champiñones, aceitunas, cebolla y tomate cherry', price: 949, type: 'COMPLEMENTED', workspace_id: wid } }),
    ])

  // Acompañamientos
  const [pFries, pOnionRings, pNuggets, pWings, pPotatoWedges] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Patatas Fritas', description: 'Patatas fritas crujientes con sal marina', price: 299, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Aros de Cebolla', description: 'Aros de cebolla rebozados en tempura ligera', price: 349, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Nuggets de Pollo', description: 'Nuggets de pollo 100% pechuga, crujientes por fuera y jugosos por dentro', price: 449, type: 'COMPLEMENTED', content: '6 unidades', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Alitas BBQ', description: 'Alitas de pollo marinadas en salsa BBQ ahumada', price: 699, type: 'COMPLEMENTED', content: '8 unidades', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Potato Wedges', description: 'Gajos de patata con piel, especiados con paprika y ajo', price: 329, type: 'COMPLEMENTED', workspace_id: wid } }),
    ])

  // Bebidas
  const [pCola, pSprite, pFanta, pWater, pOrangeJuice, pChocMilkshake, pStrawMilkshake, pCoffee, pLemonade] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Coca-Cola', description: 'La bebida refrescante clásica', price: 249, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Sprite', description: 'Lima y limón refrescante', price: 249, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Fanta Naranja', description: 'El sabor de la naranja de siempre', price: 249, type: 'COMPLEMENTED', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Agua Mineral', description: 'Agua mineral natural 50cl', price: 149, type: 'REGULAR', content: '500ml', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Zumo de Naranja Natural', description: 'Zumo exprimido al momento', price: 299, type: 'COMPLEMENTED', content: '300ml', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Batido de Chocolate', description: 'Batido cremoso de chocolate belga', price: 349, type: 'COMPLEMENTED', content: '400ml', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Batido de Fresa', description: 'Batido con fresas naturales de temporada', price: 349, type: 'COMPLEMENTED', content: '400ml', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Café', description: 'Espresso, americano o con leche', price: 199, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Limonada Casera', description: 'Limonada fresca con menta y jengibre', price: 279, type: 'REGULAR', content: '400ml', workspace_id: wid } }),
    ])

  // Postres
  const [pSundae, pApplePie, pCookie, pMcFlurry, pTiramisu, pBrownie, pCheesecake] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Sundae de Caramelo', description: 'Helado de vainilla con salsa de caramelo salado y almendras tostadas', price: 299, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Tarta de Manzana', description: 'Tarta caliente de manzana con canela y masa hojaldrada', price: 249, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Cookie de Chocolate', description: 'Galleta recién horneada con chips de chocolate', price: 149, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'McFlurry Oreo', description: 'Helado cremoso con trozos de Oreo y salsa de vainilla', price: 349, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Tiramisú', description: 'Tiramisú artesanal con mascarpone y café espresso', price: 399, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Brownie con Helado', description: 'Brownie de chocolate negro con helado de vainilla', price: 449, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Cheesecake de Frutos Rojos', description: 'Tarta de queso con coulis de frutos rojos del bosque', price: 399, type: 'REGULAR', workspace_id: wid } }),
    ])

  // Combos (parent product + children con parent_product_id)
  const [pComboBigBurger, pComboPizzaFamiliar, pComboNuggets, pMenuInfantil, pComboDoubleTrouble] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Combo Big Burger', description: 'Big Burger + Patatas Fritas medianas + Bebida a elegir. Ahorra 2.50€', price: 1299, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Combo Pizza Familiar', description: 'Pizza familiar a elegir + 2 bebidas grandes + postre. Para 3-4 personas', price: 2999, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Combo Nuggets', description: '9 Nuggets + Patatas medianas + Bebida. El favorito de siempre', price: 899, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Menú Infantil', description: 'Mini Burger + Patatas pequeñas + Bebida pequeña + Postre sorpresa', price: 699, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Combo Double Trouble', description: '2 Hamburguesas a elegir + 2 Patatas grandes + 2 Bebidas. Ideal para compartir', price: 2199, type: 'COMBO', workspace_id: wid } }),
    ])

  // Promociones (REGULAR con precio especial)
  const [pPromo2x1, pPromoPizzaBebida, pPromoLunes, pPromoFeliz, pPromoStudents] =
    await Promise.all([
      prisma.product.create({ data: { name: '2x1 en Hamburguesas', description: '🔥 Solo martes: llévate 2 hamburguesas al precio de 1. Válido en Big Burger y Crispy Chicken', price: 899, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Pizza + Bebida', description: '⚡ Pizza mediana a elegir + bebida grande por precio especial. Todos los días de 12:00 a 16:00', price: 1099, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Lunes Feliz', description: '🎉 Los lunes, patatas grandes al precio de medianas. Automático en caja', price: 299, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Happy Hour Postres', description: '🍦 De 16:00 a 18:00 todos los postres al 50%. Solo en local', price: 199, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Menú Estudiante', description: '📚 Con carnet universitario: Burger + Patatas + Bebida pequeña. De lunes a viernes', price: 799, type: 'COMBO', workspace_id: wid } }),
    ])

  // Desayunos
  const [pFullBreakfast, pToast, pCroissant, pPorridge, pNaturalJuice] =
    await Promise.all([
      prisma.product.create({ data: { name: 'Desayuno Completo', description: 'Café con leche + tostada con tomate y aceite + zumo natural. El desayuno más completo', price: 599, type: 'COMBO', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Tostada con Tomate', description: 'Pan artesanal tostado con tomate triturado, aceite de oliva virgen extra y sal en escamas', price: 199, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Croissant de Mantequilla', description: 'Croissant hojaldrado con mantequilla francesa. Recién horneado cada mañana', price: 249, type: 'REGULAR', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Porridge de Avena', description: 'Avena cocida con leche, canela, miel y frutas de temporada', price: 349, type: 'REGULAR', content: '300g', workspace_id: wid } }),
      prisma.product.create({ data: { name: 'Zumo Natural del Día', description: 'Combinación de frutas frescas de temporada exprimidas al momento', price: 349, type: 'REGULAR', content: '300ml', workspace_id: wid } }),
    ])

  // Ensaladas
  const [pCaesarSalad, pMedSalad, pGardenSalad] = await Promise.all([
    prisma.product.create({ data: { name: 'César con Pollo', description: 'Lechuga romana, pollo a la plancha, croutons, parmesano y aderezo César clásico', price: 799, type: 'REGULAR', content: '350g', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Mediterránea', description: 'Mix de lechugas, tomate cherry, pepino, feta, aceitunas y vinagreta de hierbas', price: 699, type: 'REGULAR', content: '300g', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Garden Fresh', description: 'Lechuga, zanahoria, rábano, maíz, aguacate y aderezo de yogur y limón', price: 599, type: 'REGULAR', content: '280g', workspace_id: wid } }),
  ])

  // Salsas individuales
  const [pSauceKetchup, pSauceMayo, pSauceBBQ, pSauceTruffle, pSauceChipotle] = await Promise.all([
    prisma.product.create({ data: { name: 'Salsa Ketchup', description: 'Ketchup clásico Heinz', price: 50, type: 'REGULAR', content: '30ml', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Mayonesa de Ajo', description: 'Mayonesa casera con ajo asado', price: 80, type: 'REGULAR', content: '30ml', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Salsa BBQ Ahumada', description: 'BBQ con toque de humo y especias', price: 80, type: 'REGULAR', content: '30ml', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Salsa de Trufa', description: 'Mayonesa con aceite de trufa negra', price: 120, type: 'REGULAR', content: '30ml', workspace_id: wid } }),
    prisma.product.create({ data: { name: 'Chipotle Picante', description: 'Salsa chipotle con chili y lima', price: 80, type: 'REGULAR', content: '30ml', workspace_id: wid } }),
  ])

  console.log('✅ Productos creados')

  // ─── Opciones de elección de combos (con linked_product_id) ───────────────
  // Se crean aquí porque necesitan los IDs de los productos ya creados.
  await prisma.productComplement.createMany({
    data: [
      // Elige tu hamburguesa → apunta a productos reales del catálogo
      { product_complement_type_id: ctChooseBurger.id, name: 'Big Burger',           price: 0,   increment: false, is_disabled: false, linked_product_id: pBigBurger.id },
      { product_complement_type_id: ctChooseBurger.id, name: 'Doble Bacon Burger',   price: 200, increment: true,  is_disabled: false, linked_product_id: pDoubleBacon.id },
      { product_complement_type_id: ctChooseBurger.id, name: 'Crispy Chicken Burger',price: 0,   increment: false, is_disabled: false, linked_product_id: pCrispyChicken.id },
      { product_complement_type_id: ctChooseBurger.id, name: 'Veggie Burger',        price: 0,   increment: false, is_disabled: false, linked_product_id: pVeggieBurger.id },
      { product_complement_type_id: ctChooseBurger.id, name: 'Mushroom Swiss Burger',price: 100, increment: true,  is_disabled: false, linked_product_id: pMushBurger.id },

      // Elige tu pizza → apunta a productos reales del catálogo
      { product_complement_type_id: ctChoosePizza.id, name: 'Margherita',     price: 0,   increment: false, is_disabled: false, linked_product_id: pMargherita.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'Pepperoni',      price: 100, increment: true,  is_disabled: false, linked_product_id: pPepperoni.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'Cuatro Quesos',  price: 200, increment: true,  is_disabled: false, linked_product_id: pCuatroQuesos.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'BBQ Chicken',    price: 200, increment: true,  is_disabled: false, linked_product_id: pBBQChicken.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'Hawaiana',       price: 100, increment: true,  is_disabled: false, linked_product_id: pHawaiana.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'Diavola',        price: 200, increment: true,  is_disabled: false, linked_product_id: pDiavola.id },
      { product_complement_type_id: ctChoosePizza.id, name: 'Vegetariana',    price: 50,  increment: true,  is_disabled: false, linked_product_id: pVegetariana.id },

      // Elige tu bebida → apunta a productos reales del catálogo
      { product_complement_type_id: ctChooseDrink.id, name: 'Coca-Cola',      price: 0,    increment: false, is_disabled: false, linked_product_id: pCola.id },
      { product_complement_type_id: ctChooseDrink.id, name: 'Sprite',         price: 0,    increment: false, is_disabled: false, linked_product_id: pSprite.id },
      { product_complement_type_id: ctChooseDrink.id, name: 'Fanta Naranja',  price: 0,    increment: false, is_disabled: false, linked_product_id: pFanta.id },
      { product_complement_type_id: ctChooseDrink.id, name: 'Agua Mineral',   price: -100, increment: false, is_disabled: false, linked_product_id: pWater.id },

      // Elige tu acompañamiento → apunta a productos reales del catálogo
      { product_complement_type_id: ctChooseSide.id, name: 'Patatas Fritas',  price: 0,  increment: false, is_disabled: false, linked_product_id: pFries.id },
      { product_complement_type_id: ctChooseSide.id, name: 'Aros de Cebolla',price: 50, increment: true,  is_disabled: false, linked_product_id: pOnionRings.id },
      { product_complement_type_id: ctChooseSide.id, name: 'Potato Wedges',  price: 30, increment: true,  is_disabled: false, linked_product_id: pPotatoWedges.id },

      // Elige tu postre → apunta a productos reales del catálogo
      { product_complement_type_id: ctChooseDessert.id, name: 'Sundae de Caramelo',    price: 0,   increment: false, is_disabled: false, linked_product_id: pSundae.id },
      { product_complement_type_id: ctChooseDessert.id, name: 'Cookie de Chocolate',   price: -50, increment: false, is_disabled: false, linked_product_id: pCookie.id },
      { product_complement_type_id: ctChooseDessert.id, name: 'Tarta de Manzana',      price: 0,   increment: false, is_disabled: false, linked_product_id: pApplePie.id },
      { product_complement_type_id: ctChooseDessert.id, name: 'McFlurry Oreo',         price: 50,  increment: true,  is_disabled: false, linked_product_id: pMcFlurry.id },
    ],
  })

  console.log('✅ Opciones de elección de combos creadas')

  // ─── ComboItems ────────────────────────────────────────────────────────────
  // Cada registro es un slot real de un combo. Sustituye al antiguo enfoque
  // de "productos hijo" con parent_product_id.
  // Slot fijo:     product_id definido, complement_type_id null
  // Slot flexible: product_id null, complement_type_id define las opciones
  await prisma.comboItem.createMany({
    data: [
      // Combo Big Burger: elige hamburguesa + acompañamiento + bebida
      { combo_product_id: pComboBigBurger.id, product_id: null, complement_type_id: ctChooseBurger.id, order: 0 },
      { combo_product_id: pComboBigBurger.id, product_id: null, complement_type_id: ctChooseSide.id,   order: 1 },
      { combo_product_id: pComboBigBurger.id, product_id: null, complement_type_id: ctChooseDrink.id,  order: 2 },

      // Combo Pizza Familiar: elige pizza + 2 bebidas + postre
      { combo_product_id: pComboPizzaFamiliar.id, product_id: null, complement_type_id: ctChoosePizza.id,   order: 0 },
      { combo_product_id: pComboPizzaFamiliar.id, product_id: null, complement_type_id: ctChooseDrink.id,   order: 1 },
      { combo_product_id: pComboPizzaFamiliar.id, product_id: null, complement_type_id: ctChooseDrink.id,   order: 2 },
      { combo_product_id: pComboPizzaFamiliar.id, product_id: null, complement_type_id: ctChooseDessert.id, order: 3 },

      // Combo Nuggets: Nuggets fijos (producto real) + elige acompañamiento + bebida
      { combo_product_id: pComboNuggets.id, product_id: pNuggets.id, complement_type_id: null,             order: 0 },
      { combo_product_id: pComboNuggets.id, product_id: null,        complement_type_id: ctChooseSide.id,  order: 1 },
      { combo_product_id: pComboNuggets.id, product_id: null,        complement_type_id: ctChooseDrink.id, order: 2 },

      // Menú Infantil: elige hamburguesa + acompañamiento + bebida + postre
      { combo_product_id: pMenuInfantil.id, product_id: null, complement_type_id: ctChooseBurger.id,  order: 0 },
      { combo_product_id: pMenuInfantil.id, product_id: null, complement_type_id: ctChooseSide.id,    order: 1 },
      { combo_product_id: pMenuInfantil.id, product_id: null, complement_type_id: ctChooseDrink.id,   order: 2 },
      { combo_product_id: pMenuInfantil.id, product_id: null, complement_type_id: ctChooseDessert.id, order: 3 },

      // Combo Double Trouble: 2 hamburguesas + 2 acompañamientos + 2 bebidas
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseBurger.id, order: 0 },
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseBurger.id, order: 1 },
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseSide.id,   order: 2 },
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseSide.id,   order: 3 },
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseDrink.id,  order: 4 },
      { combo_product_id: pComboDoubleTrouble.id, product_id: null, complement_type_id: ctChooseDrink.id,  order: 5 },

      // Pizza + Bebida (promo): elige pizza + bebida
      { combo_product_id: pPromoPizzaBebida.id, product_id: null, complement_type_id: ctChoosePizza.id,  order: 0 },
      { combo_product_id: pPromoPizzaBebida.id, product_id: null, complement_type_id: ctChooseDrink.id,  order: 1 },

      // Desayuno Completo: Café + Tostada + Zumo → slots fijos con productos reales
      { combo_product_id: pFullBreakfast.id, product_id: pCoffee.id,      complement_type_id: null, order: 0 },
      { combo_product_id: pFullBreakfast.id, product_id: pToast.id,       complement_type_id: null, order: 1 },
      { combo_product_id: pFullBreakfast.id, product_id: pNaturalJuice.id,complement_type_id: null, order: 2 },

      // Menú Estudiante: elige hamburguesa + acompañamiento + bebida
      { combo_product_id: pPromoStudents.id, product_id: null, complement_type_id: ctChooseBurger.id, order: 0 },
      { combo_product_id: pPromoStudents.id, product_id: null, complement_type_id: ctChooseSide.id,   order: 1 },
      { combo_product_id: pPromoStudents.id, product_id: null, complement_type_id: ctChooseDrink.id,  order: 2 },
    ],
  })

  console.log('✅ ComboItems creados')

  // ─── Asignar complementos a productos ─────────────────────────────────────
  await prisma.productProductComplementType.createMany({
    data: [
      // Hamburguesas → Tipo de carne + Extras + Sin ingredientes + Salsas
      ...[pBigBurger, pDoubleBacon, pCrispyChicken, pVeggieBurger, pMushBurger].flatMap((p) => [
        { product_id: p.id, product_complement_type_id: ctMeat.id },
        { product_id: p.id, product_complement_type_id: ctBurgerExtras.id },
        { product_id: p.id, product_complement_type_id: ctNoIngredients.id },
        { product_id: p.id, product_complement_type_id: ctSauces.id },
      ]),
      // Pizzas → Tipo de masa + Tamaño + Ingredientes extra
      ...[pMargherita, pPepperoni, pCuatroQuesos, pBBQChicken, pHawaiana, pDiavola, pVegetariana].flatMap((p) => [
        { product_id: p.id, product_complement_type_id: ctPizzaDough.id },
        { product_id: p.id, product_complement_type_id: ctPizzaSize.id },
        { product_id: p.id, product_complement_type_id: ctPizzaExtras.id },
      ]),
      // Acompañamientos → Tamaño + Salsas
      ...[pFries, pOnionRings, pNuggets, pWings, pPotatoWedges].flatMap((p) => [
        { product_id: p.id, product_complement_type_id: ctSize.id },
        { product_id: p.id, product_complement_type_id: ctSauces.id },
      ]),
      // Bebidas con tamaño
      ...[pCola, pSprite, pFanta, pOrangeJuice, pChocMilkshake, pStrawMilkshake].map((p) => ({
        product_id: p.id, product_complement_type_id: ctSize.id,
      })),
    ],
  })

  console.log('✅ Complementos asignados a productos')

  // ─── Asignar productos a categorías ───────────────────────────────────────
  await prisma.productCategory.createMany({
    data: [
      // Hamburguesas
      ...[pBigBurger, pDoubleBacon, pCrispyChicken, pVeggieBurger, pMushBurger].map((p, i) => ({
        product_id: p.id, category_id: catBurgers.id, order: i,
      })),
      // Pizzas
      ...[pMargherita, pPepperoni, pCuatroQuesos, pBBQChicken, pHawaiana, pDiavola, pVegetariana].map((p, i) => ({
        product_id: p.id, category_id: catPizzas.id, order: i,
      })),
      // Acompañamientos
      ...[pFries, pOnionRings, pNuggets, pWings, pPotatoWedges].map((p, i) => ({
        product_id: p.id, category_id: catSides.id, order: i,
      })),
      // Bebidas
      ...[pCola, pSprite, pFanta, pWater, pOrangeJuice, pChocMilkshake, pStrawMilkshake, pCoffee, pLemonade].map((p, i) => ({
        product_id: p.id, category_id: catDrinks.id, order: i,
      })),
      // Postres
      ...[pSundae, pApplePie, pCookie, pMcFlurry, pTiramisu, pBrownie, pCheesecake].map((p, i) => ({
        product_id: p.id, category_id: catDesserts.id, order: i,
      })),
      // Combos
      ...[pComboBigBurger, pComboPizzaFamiliar, pComboNuggets, pMenuInfantil, pComboDoubleTrouble].map((p, i) => ({
        product_id: p.id, category_id: catCombos.id, order: i,
      })),
      // Promociones
      ...[pPromo2x1, pPromoPizzaBebida, pPromoLunes, pPromoFeliz, pPromoStudents].map((p, i) => ({
        product_id: p.id, category_id: catPromos.id, order: i,
      })),
      // Desayunos
      ...[pFullBreakfast, pToast, pCroissant, pPorridge, pNaturalJuice, pCoffee].map((p, i) => ({
        product_id: p.id, category_id: catBreakfast.id, order: i,
      })),
      // Ensaladas
      ...[pCaesarSalad, pMedSalad, pGardenSalad].map((p, i) => ({
        product_id: p.id, category_id: catSalads.id, order: i,
      })),
      // Salsas
      ...[pSauceKetchup, pSauceMayo, pSauceBBQ, pSauceTruffle, pSauceChipotle].map((p, i) => ({
        product_id: p.id, category_id: catSauces.id, order: i,
      })),
    ],
  })

  console.log('✅ Productos asignados a categorías')

  // ─── Cartas (Menus) ────────────────────────────────────────────────────────
  const [menuPrincipal, menuDelDia, menuDesayunos, menuPromos] = await Promise.all([
    prisma.menu.create({ data: { name: 'Carta Principal', is_active: true, workspace_id: wid } }),
    prisma.menu.create({ data: { name: 'Menú del Día', is_active: true, workspace_id: wid } }),
    prisma.menu.create({ data: { name: 'Carta de Desayunos', is_active: true, workspace_id: wid } }),
    prisma.menu.create({ data: { name: 'Ofertas y Promociones', is_active: true, workspace_id: wid } }),
  ])

  // ─── Asignar categorías a cartas ──────────────────────────────────────────
  await prisma.menuCategory.createMany({
    data: [
      // Carta Principal: todo excepto desayunos
      ...[catBurgers, catPizzas, catSides, catDrinks, catDesserts, catCombos, catSalads, catSauces].map((c, i) => ({
        menu_id: menuPrincipal.id, category_id: c.id, order: i,
      })),
      // Menú del Día: burgers, acompañamientos, bebidas, postres
      ...[catBurgers, catSides, catDrinks, catDesserts].map((c, i) => ({
        menu_id: menuDelDia.id, category_id: c.id, order: i,
      })),
      // Desayunos: solo desayunos y bebidas
      ...[catBreakfast, catDrinks].map((c, i) => ({
        menu_id: menuDesayunos.id, category_id: c.id, order: i,
      })),
      // Promociones: promos y combos
      ...[catPromos, catCombos].map((c, i) => ({
        menu_id: menuPromos.id, category_id: c.id, order: i,
      })),
    ],
  })

  console.log('✅ Categorías asignadas a cartas')

  // ─── Precios especiales en Menú del Día ───────────────────────────────────
  await prisma.menuProductPrice.createMany({
    data: [
      { menu_id: menuDelDia.id, product_id: pBigBurger.id, price: 749 },
      { menu_id: menuDelDia.id, product_id: pCrispyChicken.id, price: 699 },
      { menu_id: menuDelDia.id, product_id: pVeggieBurger.id, price: 649 },
      { menu_id: menuDelDia.id, product_id: pFries.id, price: 199 },
      { menu_id: menuDelDia.id, product_id: pNuggets.id, price: 349 },
      { menu_id: menuDelDia.id, product_id: pCola.id, price: 199 },
      { menu_id: menuDelDia.id, product_id: pSprite.id, price: 199 },
      { menu_id: menuDelDia.id, product_id: pFanta.id, price: 199 },
      { menu_id: menuDelDia.id, product_id: pSundae.id, price: 199 },
      { menu_id: menuDelDia.id, product_id: pCookie.id, price: 99 },
    ],
  })

  console.log('✅ Precios especiales del Menú del Día')

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Seed completado

👤 Usuario
   Email:    admin@foodify.com
   Password: password123

🍔 Restaurante: BurgerPizza Co.
   Slug: /burgerpizza-co

📊 Datos:
   ${10} categorías
   ${8} tipos de complemento
   ${ [pBigBurger, pDoubleBacon, pCrispyChicken, pVeggieBurger, pMushBurger, pMargherita, pPepperoni, pCuatroQuesos, pBBQChicken, pHawaiana, pDiavola, pVegetariana, pFries, pOnionRings, pNuggets, pWings, pPotatoWedges, pCola, pSprite, pFanta, pWater, pOrangeJuice, pChocMilkshake, pStrawMilkshake, pCoffee, pLemonade, pSundae, pApplePie, pCookie, pMcFlurry, pTiramisu, pBrownie, pCheesecake, pComboBigBurger, pComboPizzaFamiliar, pComboNuggets, pMenuInfantil, pComboDoubleTrouble, pPromo2x1, pPromoPizzaBebida, pPromoLunes, pPromoFeliz, pPromoStudents, pFullBreakfast, pToast, pCroissant, pPorridge, pNaturalJuice, pCaesarSalad, pMedSalad, pGardenSalad, pSauceKetchup, pSauceMayo, pSauceBBQ, pSauceTruffle, pSauceChipotle].length} productos
   ${4} cartas
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
