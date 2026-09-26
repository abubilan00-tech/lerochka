import { useState, useEffect } from 'react'

// Types
interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
  // SEO fields
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

interface Category {
  id: string
  name: string
  // SEO fields
  seoTitle: string
  seoDescription: string
  seoKeywords: string
}

interface GlobalSEO {
  siteTitle: string
  siteDescription: string
  siteKeywords: string
}

const defaultGlobalSEO: GlobalSEO = {
  siteTitle: 'ShopBot — Магазин товаров | Купить онлайн через Telegram',
  siteDescription: 'ShopBot — каталог товаров с быстрой покупкой через Telegram. Электроника, одежда, аксессуары. Лучшие цены, мгновенный заказ.',
  siteKeywords: 'купить товары онлайн, интернет магазин, telegram бот магазин, каталог товаров, заказать онлайн, магазин электроники, купить одежду онлайн, аксессуары'
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Все товары', seoTitle: '', seoDescription: '', seoKeywords: '' },
  { id: '2', name: 'Электроника', seoTitle: 'Купить электронику онлайн | Наушники, смарт-часы — ShopBot', seoDescription: 'Купить электронику онлайн: беспроводные наушники, смарт-часы, портативные колонки. Лучшие цены, быстрая доставка через Telegram.', seoKeywords: 'купить электронику онлайн, беспроводные наушники купить, смарт часы купить, портативная колонка bluetooth' },
  { id: '3', name: 'Одежда', seoTitle: 'Купить одежду онлайн | Худи, футболки — ShopBot', seoDescription: 'Купить одежду онлайн: худи оверсайз, футболки, свитшоты. Стильная одежда с доставкой через Telegram бот.', seoKeywords: 'купить одежду онлайн, худи оверсайз купить, купить футболку, стильная одежда' },
  { id: '4', name: 'Аксессуары', seoTitle: 'Купить аксессуары | Чехлы, рюкзаки — ShopBot', seoDescription: 'Купить аксессуары: кожаные чехлы, городские рюкзаки с USB. Качественные аксессуары по выгодным ценам.', seoKeywords: 'купить аксессуары онлайн, кожаный чехол купить, рюкзак с usb, аксессуары для телефона' },
]

const defaultProducts: Product[] = [
  { id: '1', name: 'Беспроводные наушники', price: 2990, category: 'Электроника', image: '', description: 'Качественные беспроводные наушники с шумоподавлением', seoTitle: 'Купить беспроводные наушники | Bluetooth наушники с шумоподавлением — ShopBot', seoDescription: 'Купить беспроводные наушники с активным шумоподавлением. Bluetooth 5.0, до 30 часов работы. Быстрая доставка через Telegram.', seoKeywords: 'купить беспроводные наушники, bluetooth наушники купить, наушники с шумоподавлением, беспроводные наушники недорого' },
  { id: '2', name: 'Смарт-часы', price: 4990, category: 'Электроника', image: '', description: 'Умные часы с фитнес-трекером', seoTitle: 'Купить смарт-часы | Умные часы с фитнес-трекером — ShopBot', seoDescription: 'Купить смарт-часы с фитнес-трекером, мониторингом сна и пульса. Водонепроницаемые, совместимы с iOS и Android.', seoKeywords: 'купить смарт часы, умные часы купить, фитнес браслет, смарт часы с трекером' },
  { id: '3', name: 'Худи оверсайз', price: 3490, category: 'Одежда', image: '', description: 'Стильное худи свободного кроя', seoTitle: 'Купить худи оверсайз | Стильное худи свободного кроя — ShopBot', seoDescription: 'Купить худи оверсайз из качественного хлопка. Свободный крой, унисекс, разные цвета. Доставка через Telegram.', seoKeywords: 'купить худи оверсайз, худи свободного кроя, купить худи недорого, стильное худи' },
  { id: '4', name: 'Кожаный чехол', price: 1290, category: 'Аксессуары', image: '', description: 'Премиальный кожаный чехол для телефона', seoTitle: 'Купить кожаный чехол для телефона | Премиум чехол — ShopBot', seoDescription: 'Купить кожаный чехол для телефона из натуральной кожи. Премиальное качество, точные вырезы, защита от ударов.', seoKeywords: 'купить кожаный чехол, чехол для телефона купить, кожаный чехол премиум, чехол из кожи' },
  { id: '5', name: 'Портативная колонка', price: 3990, category: 'Электроника', image: '', description: 'Мощная Bluetooth колонка', seoTitle: 'Купить портативную Bluetooth колонку | Мощная колонка — ShopBot', seoDescription: 'Купить портативную Bluetooth колонку с мощным звуком. Водонепроницаемая, до 20 часов работы. Идеальна для путешествий.', seoKeywords: 'купить портативную колонку, bluetooth колонка купить, портативная колонка bluetooth, мощная колонка' },
  { id: '6', name: 'Рюкзак городской', price: 2490, category: 'Аксессуары', image: '', description: 'Удобный городской рюкзак с USB портом', seoTitle: 'Купить городской рюкзак с USB | Рюкзак для ноутбука — ShopBot', seoDescription: 'Купить городской рюкзак с USB портом для зарядки. Отделение для ноутбука, водоотталкивающая ткань, удобные лямки.', seoKeywords: 'купить городской рюкзак, рюкзак с usb купить, рюкзак для ноутбука, городской рюкзак недорого' },
]

const TELEGRAM_BOT_LINK = 'https://t.me/your_bot?start=buy'
const MAX_CLICKS = 10
const CLICK_WINDOW = 60000

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shop_products_v2')
    return saved ? JSON.parse(saved) : defaultProducts
  })
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('shop_categories_v2')
    return saved ? JSON.parse(saved) : defaultCategories
  })
  const [globalSEO, setGlobalSEO] = useState<GlobalSEO>(() => {
    const saved = localStorage.getItem('shop_global_seo')
    return saved ? JSON.parse(saved) : defaultGlobalSEO
  })
  const [selectedCategory, setSelectedCategory] = useState('Все товары')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [clickCounts, setClickCounts] = useState<number[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showInstruction, setShowInstruction] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', description: '', seoTitle: '', seoDescription: '', seoKeywords: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [botLink, setBotLink] = useState(() => localStorage.getItem('shop_bot_link') || TELEGRAM_BOT_LINK)
  const [savedBotLink, setSavedBotLink] = useState(false)
  const [savedSEO, setSavedSEO] = useState(false)
  const [adminTab, setAdminTab] = useState<'products' | 'categories' | 'seo' | 'settings'>('products')

  useEffect(() => { localStorage.setItem('shop_products_v2', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('shop_categories_v2', JSON.stringify(categories)) }, [categories])
  useEffect(() => { localStorage.setItem('shop_global_seo', JSON.stringify(globalSEO)) }, [globalSEO])
  useEffect(() => { localStorage.setItem('shop_bot_link', botLink) }, [botLink])

  // Dynamic SEO: update meta tags based on selected category
  useEffect(() => {
    if (showAdmin || showInstruction) return

    const cat = categories.find(c => c.name === selectedCategory)
    if (cat && cat.seoTitle && selectedCategory !== 'Все товары') {
      document.title = cat.seoTitle
      const desc = document.querySelector('meta[name="description"]')
      if (desc) desc.setAttribute('content', cat.seoDescription)
      const kw = document.querySelector('meta[name="keywords"]')
      if (kw) kw.setAttribute('content', cat.seoKeywords)
    } else {
      document.title = globalSEO.siteTitle
      const desc = document.querySelector('meta[name="description"]')
      if (desc) desc.setAttribute('content', globalSEO.siteDescription)
      const kw = document.querySelector('meta[name="keywords"]')
      if (kw) kw.setAttribute('content', globalSEO.siteKeywords)
    }
  }, [selectedCategory, categories, globalSEO, showAdmin, showInstruction])

  const handleBuy = (product: Product) => {
    const now = Date.now()
    const recentClicks = clickCounts.filter(t => now - t < CLICK_WINDOW)
    if (recentClicks.length >= MAX_CLICKS) { alert('Слишком много попыток! Подождите минуту.'); return }
    setClickCounts([...recentClicks, now])
    const message = encodeURIComponent(`Купить: ${product.name} — ${product.price}₽`)
    const link = botLink.includes('?') ? `${botLink}&text=${message}` : `${botLink}?text=${message}`
    window.open(link, '_blank')
  }

  const handleAdminLogin = () => {
    const savedPassword = localStorage.getItem('shop_admin_password') || 'admin123'
    if (adminPassword === savedPassword) { setIsAdmin(true); setShowAdmin(true); setShowPasswordModal(false); setAdminPassword('') }
    else { alert('Неверный пароль!') }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) { alert('Заполните обязательные поля'); return }
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      image: newProduct.image,
      description: newProduct.description,
      seoTitle: newProduct.seoTitle || `Купить ${newProduct.name} | ${newProduct.category} — ShopBot`,
      seoDescription: newProduct.seoDescription || newProduct.description || `Купить ${newProduct.name} по выгодной цене. Быстрая доставка через Telegram.`,
      seoKeywords: newProduct.seoKeywords || `купить ${newProduct.name.toLowerCase()}, ${newProduct.name.toLowerCase()} купить, ${newProduct.category.toLowerCase()}`
    }
    setProducts([...products, product])
    setNewProduct({ name: '', price: '', category: '', image: '', description: '', seoTitle: '', seoDescription: '', seoKeywords: '' })
  }

  const handleUpdateProduct = () => { if (!editingProduct) return; setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p)); setEditingProduct(null) }
  const handleDeleteProduct = (id: string) => { if (confirm('Удалить товар?')) setProducts(products.filter(p => p.id !== id)) }

  const handleAddCategory = () => {
    if (!newCategory) return
    if (categories.find(c => c.name === newCategory)) { alert('Категория уже существует'); return }
    setCategories([...categories, { id: Date.now().toString(), name: newCategory, seoTitle: '', seoDescription: '', seoKeywords: '' }])
    setNewCategory('')
  }

  const handleUpdateCategory = () => { if (!editingCategory) return; setCategories(categories.map(c => c.id === editingCategory.id ? editingCategory : c)); setEditingCategory(null) }
  const handleDeleteCategory = (id: string) => { if (id === '1') { alert('Нельзя удалить "Все товары"'); return }; if (confirm('Удалить?')) setCategories(categories.filter(c => c.id !== id)) }

  const handleSaveGlobalSEO = () => {
    localStorage.setItem('shop_global_seo', JSON.stringify(globalSEO))
    setSavedSEO(true)
    setTimeout(() => setSavedSEO(false), 2000)
  }

  const filteredProducts = selectedCategory === 'Все товары' ? products : products.filter(p => p.category === selectedCategory)

  const getCategoryIcon = (category: string) => { switch (category) { case 'Электроника': return 'fa-microchip'; case 'Одежда': return 'fa-shirt'; case 'Аксессуары': return 'fa-gem'; default: return 'fa-box' } }
  const getCategoryColor = (category: string) => { switch (category) { case 'Электроника': return 'from-violet-500 to-purple-600'; case 'Одежда': return 'from-purple-500 to-fuchsia-600'; case 'Аксессуары': return 'from-indigo-500 to-violet-600'; default: return 'from-violet-400 to-purple-500' } }

  // ===== INSTRUCTION PAGE =====
  if (showInstruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center"><i className="fas fa-store text-white text-lg"></i></div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">ShopBot</h1>
            </div>
            <button onClick={() => setShowInstruction(false)} className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium"><i className="fas fa-arrow-left mr-2"></i>К каталогу</button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl mb-4"><i className="fas fa-book-open text-white text-2xl"></i></div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Полная <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">инструкция</span></h2>
            <p className="text-gray-500 text-lg">От создания бота до SEO-оптимизации через админ-панель</p>
          </div>

          {/* Key update notice */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center"><i className="fas fa-check text-white"></i></div>
              <h3 className="text-lg font-bold text-green-800">SEO теперь через админ-панель!</h3>
            </div>
            <p className="text-green-700 text-sm mb-3">Больше не нужно редактировать код! Все SEO-настройки (title, description, keywords) задаются прямо в админ-панели:</p>
            <ul className="space-y-2 text-sm text-green-700">
              <li className="flex items-center gap-2"><i className="fas fa-check-circle text-green-500"></i><strong>Глобальные настройки сайта</strong> — вкладка «SEO сайта»</li>
              <li className="flex items-center gap-2"><i className="fas fa-check-circle text-green-500"></i><strong>SEO для каждой категории</strong> — кнопка ✏️ у категории</li>
              <li className="flex items-center gap-2"><i className="fas fa-check-circle text-green-500"></i><strong>SEO для каждого товара</strong> — блок «SEO» при добавлении/редактировании товара</li>
            </ul>
          </div>

          {/* TOC */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-list-ol text-violet-600 mr-2"></i>Содержание</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {[
                  { num: 1, title: '🖥 Установка программ на ПК', icon: 'fa-download', highlight: true },
                  { num: 2, title: '📁 Где взять файлы проекта', icon: 'fa-folder-open', highlight: true },
                  { num: 3, title: '🗂 Структура файлов проекта', icon: 'fa-sitemap', highlight: true },
                  { num: 4, title: '🚀 Запуск сайта на ПК', icon: 'fa-play', highlight: true },
                  { num: 5, title: '📦 Сборка проекта для сервера', icon: 'fa-box-archive', highlight: true },
                  { num: 6, title: 'Создание Telegram бота', icon: 'fa-robot' },
                  { num: 7, title: 'Вход в админ-панель', icon: 'fa-lock' },
                  { num: 8, title: 'Настройка ссылки бота', icon: 'fa-cog' },
                  { num: 9, title: 'Добавление категорий', icon: 'fa-tags' },
                  { num: 10, title: 'Добавление товаров + SEO', icon: 'fa-plus-circle' },
                  { num: 11, title: 'SEO для категорий', icon: 'fa-magnifying-glass-chart' },
                  { num: 12, title: 'Глобальные SEO-настройки', icon: 'fa-globe' },
                  { num: 13, title: 'Как работает SEO в поиске', icon: 'fa-diagram-project' },
                  { num: 14, title: 'Покупка домена', icon: 'fa-globe' },
                  { num: 15, title: 'Выбор хостинга: характеристики', icon: 'fa-server' },
                  { num: 16, title: 'Загрузка сайта на сервер', icon: 'fa-cloud-arrow-up' },
                  { num: 17, title: 'Подключение домена и SSL', icon: 'fa-link' },
                  { num: 18, title: 'Что поменять перед запуском', icon: 'fa-edit' },
                  { num: 19, title: 'Финальный чек-лист запуска', icon: 'fa-clipboard-check' },
                ].map(item => (
                  <a key={item.num} href={`#step-${item.num}`} className={`flex items-center gap-3 p-3 rounded-xl transition-all group ${item.highlight ? 'bg-green-50 hover:bg-green-100 border border-green-200' : 'hover:bg-violet-50'}`}>
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${item.highlight ? 'bg-green-200 text-green-700' : 'bg-violet-100 group-hover:bg-violet-200 text-violet-600'}`}>{item.num}</span>
                    <span className={`text-sm font-medium transition-all ${item.highlight ? 'text-green-800 font-semibold' : 'text-gray-700 group-hover:text-violet-700'}`}>{item.title}</span>
                  </a>
                ))}
              </div>
              <div className="mt-4 bg-green-50 rounded-lg p-3 border border-green-200">
                <p className="text-xs text-green-700"><i className="fas fa-star mr-1"></i><strong>Зелёным</strong> выделены шаги для запуска на ПК — начните с них!</p>
              </div>
            </div>
          {/* ===== НОВЫЕ ШАГИ: ЗАПУСК НА ПК ===== */}

          {/* Шаг 1: Установка программ */}
          <div id="step-1" className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">1</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-download text-green-600 mr-2"></i>Установка программ на ПК</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Перед началом работы нужно установить 2 программы на ваш компьютер:</p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <p className="font-bold text-green-800 text-lg mb-3"><i className="fab fa-node-js text-green-600 mr-2"></i>1. Node.js (обязательно)</p>
                <p className="text-sm text-gray-600 mb-3">Это среда для запуска JavaScript. Без неё сайт не запустится.</p>
                <div className="space-y-2">
                  <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-green-100">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Зайдите на сайт:</strong> <code className="bg-green-100 px-2 py-0.5 rounded text-green-700 font-mono text-xs">nodejs.org</code></p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-green-100">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Скачайте версию LTS</strong> (рекомендуемая, зелёная кнопка слева)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-green-100">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Запустите установщик</strong> и нажимайте «Next» → «Install» → «Finish»</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start bg-white rounded-lg p-3 border border-green-100">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Проверьте установку:</strong> откройте командную строку (Win+R → cmd) и введите:</p>
                      <div className="bg-gray-900 rounded p-2 mt-2 font-mono text-xs text-green-400">node --version</div>
                      <p className="text-xs text-gray-500 mt-1">Должно показать версию, например: <code className="bg-gray-100 px-1.5 py-0.5 rounded font-mono">v20.11.0</code></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <p className="font-bold text-blue-800 text-lg mb-3"><i className="fas fa-code text-blue-600 mr-2"></i>2. Редактор кода (рекомендуется)</p>
                <p className="text-sm text-gray-600 mb-3">Для удобного редактирования файлов проекта.</p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="font-semibold text-blue-700 mb-2">⭐ Visual Studio Code (рекомендуется)</p>
                    <p className="text-xs text-gray-600 mb-2">Бесплатный, мощный, с подсветкой синтаксиса</p>
                    <p className="text-xs"><strong>Скачать:</strong> <code className="bg-blue-100 px-2 py-0.5 rounded text-blue-700 font-mono">code.visualstudio.com</code></p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-100">
                    <p className="font-semibold text-gray-700 mb-2">Альтернативы:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• <strong>Sublime Text</strong> — лёгкий и быстрый</li>
                      <li>• <strong>Notepad++</strong> — простой, для Windows</li>
                      <li>• <strong>WebStorm</strong> — платный, но очень мощный</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-lightbulb mr-2"></i><strong>Итого нужно установить:</strong></p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 ml-5 list-disc">
                  <li>✅ Node.js (обязательно)</li>
                  <li>✅ Visual Studio Code (рекомендуется)</li>
                  <li>⏱ Время установки: 5-10 минут</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Шаг 2: Где взять файлы */}
          <div id="step-2" className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">2</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-folder-open text-green-600 mr-2"></i>Где взять файлы проекта</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Файлы проекта — это код сайта. Их нужно скачать на ваш компьютер.</p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <p className="font-bold text-green-800 text-lg mb-3"><i className="fas fa-download text-green-600 mr-2"></i>Вариант 1: Скачать архивом</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Получите архив с файлами проекта (ZIP/RAR)',
                    'Распакуйте архив в удобную папку (например: C:\\Projects\\my-shop)',
                    'Убедитесь, что внутри есть файлы: package.json, src/, index.html',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                <p className="font-bold text-blue-800 text-lg mb-3"><i className="fab fa-github text-blue-600 mr-2"></i>Вариант 2: Скачать с GitHub</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зайдите на страницу репозитория проекта на GitHub',
                    'Нажмите зелёную кнопку «Code»',
                    'Выберите «Download ZIP»',
                    'Распакуйте архив в удобную папку',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-blue-200 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-5 border border-purple-200">
                <p className="font-bold text-purple-800 text-lg mb-3"><i className="fas fa-code-branch text-purple-600 mr-2"></i>Вариант 3: Клонировать через Git</p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
                  <p className="text-gray-400"># Откройте терминал в папке проектов и введите:</p>
                  <p className="text-green-400">git clone https://github.com/username/my-shop.git</p>
                  <p className="text-green-400">cd my-shop</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-lightbulb mr-2"></i><strong>Совет:</strong> Создайте отдельную папку для проектов, например: <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-xs">C:\\Projects\\</code> или <code className="bg-amber-100 px-2 py-0.5 rounded font-mono text-xs">~/Documents/Projects/</code></p>
              </div>
            </div>
          </div>

          {/* Шаг 3: Структура файлов */}
          <div id="step-3" className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">3</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-sitemap text-green-600 mr-2"></i>Структура файлов проекта</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Вот как выглядят файлы проекта и за что каждый отвечает:</p>

              <div className="bg-gray-900 rounded-xl p-5 font-mono text-xs overflow-x-auto">
                <pre className="text-gray-300">
{`my-shop/                          # 📁 Корень проекта
├── 📄 package.json                 # ⚙️ Настройки проекта и зависимости
├── 📄 package-lock.json            # 🔒 Зафиксированные версии пакетов
├── 📄 index.html                   # 🌐 Главная HTML страница (мета-теги SEO)
├── 📄 vite.config.js               # ⚙️ Настройки сборщика Vite
├── 📄 tsconfig.json                # ⚙️ Настройки TypeScript
│
├── 📁 src/                         # 📂 Исходный код (здесь писать!)
│   ├── 📄 main.tsx                 # 🚀 Точка входа (запуск React)
│   ├── 📄 App.tsx                  # 🎨 ГЛАВНЫЙ ФАЙЛ — весь интерфейс
│   └── 📄 index.css                # 🎨 Стили (Tailwind CSS)
│
├── 📁 public/                      # 📂 Статические файлы (картинки, иконки)
│   └── 📄 favicon.ico              # 🖼 Иконка сайта
│
└── 📁 dist/                        # 📦 Готовый сайт (после сборки)
    ├── 📄 index.html               # 🌐 Готовая HTML страница
    └── 📁 assets/                  # 📦 CSS и JS файлы
        ├── 📄 index-xxxxx.css      # 🎨 Стили
        └── 📄 index-xxxxx.js       # ⚙️ JavaScript код`}
                </pre>
              </div>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-200">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-star text-violet-600 mr-2"></i>Главные файлы для редактирования:</p>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border border-violet-100">
                    <p className="font-semibold text-violet-700 mb-2">📄 src/App.tsx — ГЛАВНЫЙ ФАЙЛ</p>
                    <p className="text-sm text-gray-600 mb-2">Здесь весь интерфейс сайта: каталог, админ-панель, инструкция</p>
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                      <p>• Строки 1-100: Настройки, константы, данные по умолчанию</p>
                      <p>• Строки 100-400: Компоненты (каталог, админка, модалки)</p>
                      <p>• Строки 400-800: Инструкция (шаги 1-19)</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-violet-100">
                    <p className="font-semibold text-violet-700 mb-2">📄 index.html — МЕТА-ТЕГИ SEO</p>
                    <p className="text-sm text-gray-600 mb-2">Здесь title, description, keywords для главной страницы</p>
                    <div className="bg-gray-50 rounded p-2 text-xs text-gray-600">
                      <p>• Строка 7: <code className="bg-gray-200 px-1 rounded">&lt;title&gt;</code> — заголовок вкладки</p>
                      <p>• Строка 9: <code className="bg-gray-200 px-1 rounded">&lt;meta name="description"&gt;</code> — описание</p>
                      <p>• Строка 10: <code className="bg-gray-200 px-1 rounded">&lt;meta name="keywords"&gt;</code> — ключевые слова</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-violet-100">
                    <p className="font-semibold text-violet-700 mb-2">📄 src/index.css — СТИЛИ</p>
                    <p className="text-sm text-gray-600">Здесь можно менять цвета, шрифты, анимации (редко нужно трогать)</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Важно:</strong> Не удаляйте и не переименовывайте файлы! Особенно <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">package.json</code>, <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">vite.config.js</code>, <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">tsconfig.json</code></p>
              </div>
            </div>
          </div>

          {/* Шаг 4: Запуск на ПК */}
          <div id="step-4" className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">4</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-play text-green-600 mr-2"></i>Запуск сайта на ПК (локально)</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Теперь запустим сайт на вашем компьютере для разработки и тестирования.</p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <p className="font-bold text-green-800 text-lg mb-3"><i className="fas fa-terminal text-green-600 mr-2"></i>Пошаговая инструкция:</p>
                <ol className="space-y-3 ml-1">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Откройте папку проекта</strong> в проводнике</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Откройте терминал в этой папке:</strong></p>
                      <ul className="text-xs text-gray-600 mt-1 space-y-1 ml-4">
                        <li>• <strong>Windows:</strong> Shift + правый клик → «Открыть в терминале» или «Открыть PowerShell»</li>
                        <li>• <strong>Mac/Linux:</strong> правый клик → «Открыть в терминале»</li>
                        <li>• <strong>VS Code:</strong> Ctrl+` (или меню Terminal → New Terminal)</li>
                      </ul>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Установите зависимости</strong> (первый раз, занимает 1-2 минуты):</p>
                      <div className="bg-gray-900 rounded p-2 mt-2 font-mono text-xs text-green-400">npm install</div>
                      <p className="text-xs text-gray-500 mt-1">Создастся папка <code className="bg-gray-100 px-1 rounded">node_modules/</code> со всеми библиотеками</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Запустите сайт в режиме разработки:</strong></p>
                      <div className="bg-gray-900 rounded p-2 mt-2 font-mono text-xs text-green-400">npm run dev</div>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Откройте сайт в браузере:</strong></p>
                      <div className="bg-gray-900 rounded p-2 mt-2 font-mono text-xs">
                        <p className="text-gray-400"># В терминале появится ссылка:</p>
                        <p className="text-green-400">Local:   http://localhost:3000/</p>
                        <p className="text-green-400">Network: http://192.168.1.5:3000/</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Откройте <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code> в браузере</p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm"><i className="fas fa-sync mr-2"></i><strong>Автоматическое обновление:</strong> Когда вы меняете код в <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">src/App.tsx</code> — сайт автоматически перезагружается в браузере! Не нужно перезапускать.</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-stop-circle mr-2"></i><strong>Остановить сервер:</strong> В терминале нажмите <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">Ctrl+C</code></p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Готово!</strong> Теперь сайт работает на вашем компьютере. Можете редактировать код и сразу видеть изменения.</p>
              </div>
            </div>
          </div>

          {/* Шаг 5: Сборка проекта */}
          <div id="step-5" className="bg-white rounded-2xl shadow-sm border-2 border-green-200 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center text-white font-bold">5</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-box-archive text-green-600 mr-2"></i>Сборка проекта для сервера</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Когда закончите редактировать — нужно собрать готовую версию сайта для загрузки на сервер.</p>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200">
                <p className="font-bold text-green-800 text-lg mb-3"><i className="fas fa-terminal text-green-600 mr-2"></i>Команда сборки:</p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
                  <p className="text-gray-400"># В терминале (в папке проекта) введите:</p>
                  <p className="text-green-400">npm run build</p>
                </div>
                <p className="text-sm text-gray-600 mt-3">Эта команда создаст папку <code className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">dist/</code> с готовым сайтом.</p>
              </div>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-200">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-folder-open text-violet-600 mr-2"></i>Что внутри папки dist/:</p>
                <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs">
                  <pre className="text-gray-300">
{`dist/
├── 📄 index.html          # 🌐 Главная страница (1-3 КБ)
└── 📁 assets/             # 📦 Оптимизированные файлы
    ├── 📄 index-xxxxx.css # 🎨 Все стили (25-35 КБ)
    └── 📄 index-xxxxx.js  # ⚙️ Весь JavaScript (200-250 КБ)`}
                  </pre>
                </div>
                <p className="text-sm text-gray-600 mt-3">Эти файлы нужно загрузить на хостинг (шаг 16).</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm"><i className="fas fa-eye mr-2"></i><strong>Проверка перед загрузкой:</strong> Откройте файл <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/index.html</code> в браузере (двойной клик) — должен открыться ваш сайт!</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-lightbulb mr-2"></i><strong>Когда пересобирать:</strong> Каждый раз после изменений в коде запускайте <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">npm run build</code> и загружайте новую версию на сервер.</p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Итог:</strong> Теперь у вас есть готовая папка <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/</code> с оптимизированным сайтом. Можно загружать на хостинг!</p>
              </div>
            </div>
          </div>

          {/* ===== СУЩЕСТВУЮЩИЕ ШАГИ (перенумерованы) ===== */}

          {/* Шаг 6: Создание Telegram бота */}
          <div id="step-6" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">6</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-robot text-violet-600 mr-2"></i>Создание Telegram бота</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <ol className="space-y-3 ml-1">
                {['Откройте Telegram, найдите @BotFather', 'Нажмите «Start»', 'Отправьте /newbot', 'Введите имя бота (Мой Магазин)', 'Введите username (my_shop_bot)', 'Сохраните токен'].map((s, i) => (
                  <li key={i} className="flex gap-3"><span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span><span>{s}</span></li>
                ))}
              </ol>
            </div>
          </div>

          <div id="step-7" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">7</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-lock text-violet-600 mr-2"></i>Вход в админ-панель</h3>
            </div>
            <p className="text-gray-600 mb-3">Нажмите «⚙ Админ» → пароль: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">admin123</code></p>
          </div>

          <div id="step-8" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">8</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-cog text-violet-600 mr-2"></i>Настройка ссылки бота</h3>
            </div>
            <p className="text-gray-600">Вкладка «⚙️ Настройки» → вставьте ссылку <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">https://t.me/my_shop_bot?start=buy</code> → Сохранить</p>
          </div>

          <div id="step-9" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">9</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-tags text-violet-600 mr-2"></i>Добавление категорий</h3>
            </div>
            <p className="text-gray-600 mb-3">Вкладка «🏷 Категории» → введите название → «Добавить»</p>
            <div className="bg-violet-50 rounded-xl p-4 border border-violet-100">
              <p className="font-semibold text-violet-800 mb-2">SEO для категории:</p>
              <p className="text-sm text-gray-600">Нажмите ✏️ рядом с категорией → заполните SEO-поля → Сохранить</p>
            </div>
          </div>

          <div id="step-10" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">10</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-plus-circle text-violet-600 mr-2"></i>Добавление товаров + SEO</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Вкладка «📦 Товары» → заполните поля:</p>
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3">Основные поля:</p>
                <ul className="space-y-2 text-sm">
                  <li>📦 <strong>Название</strong> — имя товара</li>
                  <li>💰 <strong>Цена</strong> — в рублях</li>
                  <li>🏷 <strong>Категория</strong> — из списка</li>
                  <li>🖼 <strong>URL фото</strong> — ссылка на картинку</li>
                  <li>📝 <strong>Описание</strong> — краткое описание</li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                <p className="font-semibold text-green-800 mb-3"><i className="fas fa-magnifying-glass-chart mr-2"></i>SEO-поля (для поиска):</p>
                <ul className="space-y-2 text-sm">
                  <li>🔹 <strong>SEO Title</strong> — заголовок для поисковика (50-60 символов). Пример: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">Купить тг аккаунт | Telegram аккаунт — ShopBot</code></li>
                  <li>🔹 <strong>SEO Description</strong> — описание для поисковика (150-160 символов). Пример: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">Купить Telegram аккаунт быстро и безопасно. Готовые ТГ аккаунты с номером.</code></li>
                  <li>🔹 <strong>SEO Keywords</strong> — ключевые слова через запятую. Пример: <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs break-all">купить тг аккаунт, телеграм аккаунт купить, тг аккаунт с номером</code></li>
                </ul>
                <div className="mt-3 bg-green-100 rounded p-3">
                  <p className="text-xs text-green-800"><i className="fas fa-lightbulb mr-1"></i><strong>Автозаполнение:</strong> Если SEO-поля пустые — они заполнятся автоматически из названия и описания товара!</p>
                </div>
              </div>
            </div>
          </div>

          <div id="step-11" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">11</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-magnifying-glass-chart text-violet-600 mr-2"></i>SEO для категорий</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Каждая категория может иметь свои SEO-теги. Когда пользователь выбирает категорию — мета-теги сайта меняются автоматически!</p>
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3">Как настроить:</p>
                <ol className="space-y-2 text-sm">
                  <li>1. Вкладка «🏷 Категории»</li>
                  <li>2. Нажмите ✏️ рядом с категорией</li>
                  <li>3. Заполните SEO Title, Description, Keywords</li>
                  <li>4. Нажмите «Сохранить»</li>
                </ol>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Результат:</strong> При выборе категории «Электроника» в каталоге — title и description сайта автоматически меняются на SEO-теги этой категории!</p>
              </div>
            </div>
          </div>

          <div id="step-12" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">12</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-globe text-violet-600 mr-2"></i>Глобальные SEO-настройки</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Вкладка «🔍 SEO сайта» — настройки для главной страницы и всего сайта:</p>
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <ul className="space-y-3 text-sm">
                  <li><strong>Название сайта (Title)</strong> — отображается во вкладке браузера и в поиске</li>
                  <li><strong>Описание сайта (Description)</strong> — текст под ссылкой в поиске</li>
                  <li><strong>Ключевые слова (Keywords)</strong> — общие ключи для всего сайта</li>
                </ul>
              </div>
            </div>
          </div>

          <div id="step-13" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">13</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-diagram-project text-violet-600 mr-2"></i>Как работает SEO в поиске</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Каждый товар/категория имеет <strong>свои ключи</strong>. Поисковик показывает нужную страницу по нужному запросу:</p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold">🔍 «купить тг аккаунт»</span>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">✅ Страница ТГ аккаунтов</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full font-bold">🔍 «купить номер физ»</span>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">✅ Страница Номера физ</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-sm">
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">🔍 «купить наушники»</span>
                  <i className="fas fa-arrow-right text-gray-400"></i>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-bold">✅ Страница Электроника</span>
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i><strong>Важно:</strong> Не смешивайте ключи! На странице про «тг аккаунт» не пишите «купить номер физ» — поисковик запутается.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 9: ПОКУПКА ДОМЕНА ===== */}
          <div id="step-14" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">14</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-globe text-violet-600 mr-2"></i>Покупка домена</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Домен — это адрес вашего сайта (например: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">myshop.ru</code>)</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-store mr-2"></i>Где купить домен:</p>
                <div className="space-y-3">
                  {[
                    { name: 'REG.RU', url: 'reg.ru', price: 'от 199₽/год (.ru)', note: 'Крупный российский регистратор, простая панель' },
                    { name: 'Beget', url: 'beget.com', price: 'от 299₽/год (.ru)', note: 'Хостинг + домен в одном месте, удобно' },
                    { name: 'Namecheap', url: 'namecheap.com', price: 'от $8.88/год (.com)', note: 'Международный, много зон' },
                    { name: 'Cloudflare Registrar', url: 'cloudflare.com', price: 'по себестоимости', note: 'Без наценки + бесплатная защита от DDoS' },
                  ].map((reg, i) => (
                    <div key={i} className="flex gap-3 items-start bg-white rounded-lg p-3 border border-violet-100">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-violet-700">{reg.name}</strong>
                          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full">{reg.url}</span>
                        </div>
                        <p className="text-sm text-gray-500">{reg.note}</p>
                        <p className="text-sm font-semibold text-green-600">{reg.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Как купить домен:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зайдите на сайт регистратора (например, reg.ru)',
                    'В поисковой строке введите желаемое имя домена',
                    'Проверьте доступность — если свободно, добавьте в корзину',
                    'Зарегистрируйтесь / войдите в аккаунт',
                    'Заполните данные (ФИО, email, телефон)',
                    'Оплатите (карта, СБП, электронные кошельки)',
                    'Домен появится в вашем личном кабинете',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-lightbulb mr-2"></i><strong>Советы по выбору домена:</strong></p>
                <ul className="mt-2 space-y-1 text-sm text-amber-700 ml-5 list-disc">
                  <li>Короткий и запоминающийся (до 15 символов)</li>
                  <li>Легко пишется и произносится</li>
                  <li>Содержит ключевое слово (shop, store, купить)</li>
                  <li>Зона .ru — для России, .com — международный</li>
                  <li>Избегайте дефисов и цифр</li>
                </ul>
              </div>
            </div>
          </div>

          {/* ===== STEP 10: ВЫБОР ХОСТИНГА ===== */}
          <div id="step-15" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">15</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-server text-violet-600 mr-2"></i>Выбор хостинга: характеристики и тарифы</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Хостинг — это место, где хранятся файлы вашего сайта. Наш сайт — статический (HTML/CSS/JS), поэтому требования минимальные.</p>

              {/* Характеристики */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-microchip text-violet-600 mr-2"></i>Какие характеристики важны:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { icon: 'fa-hard-drive', title: 'Дисковое пространство', desc: 'Для статического сайта: 500 МБ — 1 ГБ достаточно', rec: 'Рекомендуется: 1 ГБ' },
                    { icon: 'fa-memory', title: 'Оперативная память (RAM)', desc: 'Для статики не критично, но влияет на скорость', rec: 'Рекомендуется: 512 МБ — 1 ГБ' },
                    { icon: 'fa-network-wired', title: 'Трафик (бандвит)', desc: 'Объём данных, который могут скачать посетители', rec: 'Рекомендуется: безлимит или 10+ ГБ/мес' },
                    { icon: 'fa-bolt', title: 'Скорость загрузки', desc: 'Время отклика сервера. Влияет на SEO и UX', rec: 'Рекомендуется: SSD диски, CDN' },
                    { icon: 'fa-shield-halved', title: 'SSL-сертификат', desc: 'HTTPS для безопасного соединения. Должен быть бесплатным', rec: 'Обязательно: Let\'s Encrypt (бесплатно)' },
                    { icon: 'fa-headset', title: 'Поддержка', desc: 'Техподдержка 24/7 на русском языке', rec: 'Рекомендуется: чат + тикеты' },
                  ].map((item, i) => (
                    <div key={i} className="bg-white rounded-lg p-3 border border-violet-100">
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`fas ${item.icon} text-violet-500`}></i>
                        <p className="font-semibold text-gray-800 text-sm">{item.title}</p>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{item.desc}</p>
                      <p className="text-xs font-semibold text-green-600">{item.rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Конкретные тарифы */}
              <div className="bg-white rounded-xl p-5 border-2 border-violet-200">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-tags text-violet-600 mr-2"></i>Конкретные тарифы хостингов:</p>
                
                <div className="space-y-4">
                  {/* Бесплатные */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <p className="font-bold text-green-800 mb-3">🆓 БЕСПЛАТНЫЕ (рекомендуется для старта)</p>
                    <div className="space-y-3">
                      {[
                        { name: 'GitHub Pages', specs: '1 ГБ хранилище, 100 ГБ трафик/мес, SSL бесплатно, CDN', pros: 'Идеально для статических сайтов, автодеплой из Git', cons: 'Нужен GitHub аккаунт', url: 'pages.github.com' },
                        { name: 'Netlify', specs: '100 ГБ трафик/мес, SSL бесплатно, формы, функции', pros: 'Drag & drop загрузка, мгновенный деплой', cons: 'Бесплатный тариф ограничен 300 минут сборки/мес', url: 'netlify.com' },
                        { name: 'Vercel', specs: '100 ГБ трафик/мес, SSL, Edge Network', pros: 'Очень быстрый, автодеплой', cons: 'Ориентирован на фреймворки, но работает и со статикой', url: 'vercel.com' },
                        { name: 'Cloudflare Pages', specs: 'Безлимитный трафик, SSL, DDoS защита, CDN', pros: 'Лучшая защита от DDoS, глобальный CDN', cons: 'Нужен Cloudflare аккаунт', url: 'pages.cloudflare.com' },
                      ].map((host, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-green-100">
                          <div className="flex items-center gap-2 mb-2">
                            <strong className="text-green-700">{host.name}</strong>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{host.url}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1"><strong>Характеристики:</strong> {host.specs}</p>
                          <p className="text-xs text-green-600 mb-1"><strong>Плюсы:</strong> {host.pros}</p>
                          <p className="text-xs text-amber-600"><strong>Минусы:</strong> {host.cons}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Платные (Россия) */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="font-bold text-blue-800 mb-3">💰 ПЛАТНЫЕ (Россия) — от 200₽/мес</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Beget', tariff: 'Старт', price: '0₽/мес (бесплатный)', specs: '1 ГБ диск, 10 ГБ трафик, 1 сайт, SSL бесплатно', pros: 'Простая панель, поддержка на русском', cons: 'Ограниченный бесплатный тариф', url: 'beget.com' },
                        { name: 'Timeweb', tariff: 'Первый', price: '199₽/мес', specs: '5 ГБ SSD, безлимит трафик, 1 сайт, SSL бесплатно', pros: 'Надёжный, быстрый SSD, хорошая поддержка', cons: 'Платный', url: 'timeweb.com' },
                        { name: 'REG.RU Хостинг', tariff: 'Базовый', price: '180₽/мес', specs: '2 ГБ SSD, 10 ГБ трафик, 1 сайт, SSL', pros: 'Домен + хостинг в одном месте', cons: 'Мало места на базовом тарифе', url: 'reg.ru/hosting' },
                        { name: 'SprintHost', tariff: 'Мини', price: '99₽/мес', specs: '1 ГБ SSD, 10 ГБ трафик, 1 сайт', pros: 'Очень дешёвый', cons: 'Медленная поддержка', url: 'sprinthost.ru' },
                      ].map((host, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-blue-100">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <strong className="text-blue-700">{host.name}</strong>
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Тариф: {host.tariff}</span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">{host.price}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1"><strong>Характеристики:</strong> {host.specs}</p>
                          <p className="text-xs text-green-600 mb-1"><strong>Плюсы:</strong> {host.pros}</p>
                          <p className="text-xs text-amber-600"><strong>Минусы:</strong> {host.cons}</p>
                          <p className="text-xs text-gray-500 mt-1"><i className="fas fa-link mr-1"></i>{host.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Платные (международные) */}
                  <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="font-bold text-purple-800 mb-3">🌍 ПЛАТНЫЕ (международные) — от $3/мес</p>
                    <div className="space-y-3">
                      {[
                        { name: 'Hostinger', tariff: 'Premium', price: '$2.99/мес', specs: '100 ГБ SSD, безлимит трафик, 100 сайтов, SSL', pros: 'Очень быстрый, хорошая цена', cons: 'Поддержка на английском', url: 'hostinger.com' },
                        { name: 'DigitalOcean', tariff: 'Droplet', price: '$4/мес', specs: '1 ГБ RAM, 25 ГБ SSD, 1 ТБ трафик', pros: 'VPS — полный контроль, масштабируемый', cons: 'Нужны навыки администрирования', url: 'digitalocean.com' },
                        { name: 'AWS (Amazon)', tariff: 'S3 + CloudFront', price: '~$1-5/мес', specs: 'Безлимит хранилище, глобальный CDN', pros: 'Масштабируемость, надёжность', cons: 'Сложная настройка', url: 'aws.amazon.com' },
                      ].map((host, i) => (
                        <div key={i} className="bg-white rounded-lg p-3 border border-purple-100">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <strong className="text-purple-700">{host.name}</strong>
                            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">Тариф: {host.tariff}</span>
                            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-bold">{host.price}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1"><strong>Характеристики:</strong> {host.specs}</p>
                          <p className="text-xs text-green-600 mb-1"><strong>Плюсы:</strong> {host.pros}</p>
                          <p className="text-xs text-amber-600"><strong>Минусы:</strong> {host.cons}</p>
                          <p className="text-xs text-gray-500 mt-1"><i className="fas fa-link mr-1"></i>{host.url}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Рекомендация:</strong> Для начала используйте <strong>GitHub Pages</strong> или <strong>Netlify</strong> — бесплатно, быстро, с автоматическим SSL. Когда проект вырастет — переходите на платный хостинг.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 11: ЗАГРУЗКА НА СЕРВЕР ===== */}
          <div id="step-16" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">16</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-cloud-arrow-up text-violet-600 mr-2"></i>Загрузка сайта на сервер (пошагово)</h3>
            </div>
            <div className="space-y-4 text-gray-600">

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i><strong>Важно:</strong> Загружать нужно содержимое папки <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/</code>, а не саму папку! Внутри должны быть файлы: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">index.html</code>, <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">assets/</code></p>
              </div>

              {/* GitHub Pages */}
              <div className="bg-white rounded-xl p-5 border-2 border-violet-200">
                <p className="font-bold text-violet-800 mb-3 text-lg">Вариант A: GitHub Pages (рекомендуется)</p>
                <div className="bg-violet-50 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-violet-700 mb-2">Что нужно:</p>
                  <ul className="text-sm text-violet-600 space-y-1">
                    <li>• Аккаунт на <strong>github.com</strong> (бесплатно)</li>
                    <li>• Файлы сайта (папка <code className="bg-violet-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/</code>)</li>
                  </ul>
                </div>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зарегистрируйтесь на github.com',
                    'Нажмите «New repository» (зелёная кнопка)',
                    'Назовите репозиторий: my-shop-site (или любое имя)',
                    'Выберите «Public» (публичный)',
                    'Нажмите «Create repository»',
                    'На странице репозитория нажмите «uploading an existing file»',
                    'Откройте папку dist/ на компьютере',
                    'Перетащите ВСЕ файлы из dist/ в браузер (index.html, assets/)',
                    'Нажмите «Commit changes»',
                    'Перейдите в Settings → Pages',
                    'В разделе «Source» выберите ветку main и папку / (root)',
                    'Нажмите «Save»',
                    'Через 1-2 минуты сайт будет доступен: https://ваш-username.github.io/my-shop-site/',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Netlify */}
              <div className="bg-white rounded-xl p-5 border-2 border-purple-200">
                <p className="font-bold text-purple-800 mb-3 text-lg">Вариант B: Netlify (drag & drop — самый простой)</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зарегистрируйтесь на netlify.com (можно через GitHub/Google)',
                    'После входа вы увидите область «Drag and drop your site folder here»',
                    'Откройте папку dist/ на компьютере',
                    'Перетащите ВСЮ папку dist/ прямо в браузер на Netlify',
                    'Подождите 30 секунд — загрузка и деплой',
                    'Сайт доступен по ссылке: https://random-name-123.netlify.app',
                    'Можно изменить имя сайта: Site settings → Change site name',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Обычный хостинг FTP */}
              <div className="bg-white rounded-xl p-5 border-2 border-indigo-200">
                <p className="font-bold text-indigo-800 mb-3 text-lg">Вариант C: Обычный хостинг (FTP — Beget, Timeweb и т.д.)</p>
                <div className="bg-indigo-50 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-indigo-700 mb-2">Что нужно:</p>
                  <ul className="text-sm text-indigo-600 space-y-1">
                    <li>• Купленный хостинг (Beget, Timeweb, REG.RU)</li>
                    <li>• FTP-клиент: <strong>FileZilla</strong> (бесплатно, filezilla-project.org)</li>
                    <li>• Данные FTP из панели хостинга (адрес, логин, пароль)</li>
                  </ul>
                </div>
                <ol className="space-y-3 ml-1">
                  {[
                    'Купите хостинг (например, Beget — бесплатный тариф)',
                    'Войдите в панель управления хостингом',
                    'Найдите раздел «FTP» или «Файловый менеджер»',
                    'Скопируйте данные FTP: адрес (ftp.ваш-домен.ru), логин, пароль',
                    'Скачайте и установите FileZilla (filezilla-project.org)',
                    'Откройте FileZilla → введите данные FTP вверху:',
                    'Хост: ftp.ваш-домен.ru | Логин: ваш_логин | Пароль: ваш_пароль | Порт: 21',
                    'Нажмите «Быстрое соединение»',
                    'Справа откройте папку public_html/ (или www/)',
                    'Слева откройте папку dist/ на вашем компьютере',
                    'Выделите ВСЕ файлы в dist/ (Ctrl+A)',
                    'Перетащите их в public_html/ справа',
                    'Дождитесь загрузки (1-2 минуты)',
                    'Сайт доступен по вашему домену!',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Проверка:</strong> После загрузки откройте сайт в браузере. Если видите каталог товаров — всё работает!</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 12: ПОДКЛЮЧЕНИЕ ДОМЕНА ===== */}
          <div id="step-17" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">17</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-link text-violet-600 mr-2"></i>Подключение домена и SSL</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Привязываем ваш купленный домен к сайту на хостинге.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-link mr-2"></i>Подключение домена к GitHub Pages:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'В репозитории: Settings → Pages → Custom domain',
                    'Введите ваш домен: myshop.ru',
                    'Нажмите «Save»',
                    'В личном кабинете регистратора домена найдите «DNS» или «Управление зоной»',
                    'Добавьте A-записи, указывающие на IP GitHub:',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
                <div className="bg-gray-900 rounded-lg p-4 mt-3 font-mono text-sm">
                  <p className="text-green-400">A  @  185.199.108.153</p>
                  <p className="text-green-400">A  @  185.199.109.153</p>
                  <p className="text-green-400">A  @  185.199.110.153</p>
                  <p className="text-green-400">A  @  185.199.111.153</p>
                </div>
                <p className="text-sm text-gray-500 mt-3">Поставьте галочку «Enforce HTTPS» в настройках Pages</p>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-purple-200">
                <p className="font-semibold text-purple-800 mb-3"><i className="fas fa-link mr-2"></i>Подключение домена к Netlify:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Netlify → Domain settings → Add custom domain',
                    'Введите ваш домен: myshop.ru',
                    'Netlify покажет нужные DNS-записи',
                    'Скопируйте их',
                    'В личном кабинете регистратора домена → DNS → Добавить записи',
                    'Вставьте записи из Netlify',
                    'Ожидайте 5-30 минут (иногда до 24 часов)',
                    'SSL подключится автоматически',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-indigo-200">
                <p className="font-semibold text-indigo-800 mb-3"><i className="fas fa-link mr-2"></i>Подключение домена к обычному хостингу:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Домен уже привязан автоматически при покупке хостинга',
                    'Если нет — в панели хостинга найдите «Привязка доменов»',
                    'Добавьте ваш домен',
                    'SSL (Let\'s Encrypt) обычно включается в один клик в панели',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-shield-halved mr-2"></i><strong>SSL (HTTPS)</strong> подключается автоматически на GitHub Pages и Netlify. На обычном хостинге — через Let's Encrypt (бесплатно) в панели хостинга.</p>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-clock mr-2"></i><strong>Время propagation:</strong> После изменения DNS-записей домен может работать не сразу. Подождите от 5 минут до 24 часов.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 13: ЧТО ПОМЕНЯТЬ ПЕРЕД ЗАПУСКОМ ===== */}
          <div id="step-18" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">18</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-edit text-violet-600 mr-2"></i>Что нужно поменять перед запуском</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Перед публикацией сайта обязательно проверьте и измените следующие настройки:</p>

              <div className="bg-red-50 rounded-xl p-5 border border-red-200">
                <p className="font-bold text-red-800 text-lg mb-3"><i className="fas fa-exclamation-triangle mr-2"></i>ОБЯЗАТЕЛЬНО ИЗМЕНИТЬ:</p>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <p className="font-semibold text-red-700 mb-2">1. Ссылка на Telegram бота</p>
                    <p className="text-sm text-gray-600 mb-2">В админ-панели → вкладка «⚙️ Настройки» → замените <code className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-mono text-xs break-all">https://t.me/your_bot?start=buy</code> на ссылку вашего бота</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                      <p className="text-red-400">❌ Было: https://t.me/your_bot?start=buy</p>
                      <p className="text-green-400">✅ Стало: https://t.me/my_shop_bot?start=buy</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <p className="font-semibold text-red-700 mb-2">2. Пароль админ-панели</p>
                    <p className="text-sm text-gray-600 mb-2">По умолчанию пароль <code className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-mono text-xs">admin123</code>. Его нужно изменить в коде!</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                      <p className="text-gray-400">// Найдите в коде (src/App.tsx) строку:</p>
                      <p className="text-red-400">❌ const savedPassword = localStorage.getItem('shop_admin_password') || 'admin123'</p>
                      <p className="text-gray-400">// Замените на свой пароль:</p>
                      <p className="text-green-400">✅ const savedPassword = localStorage.getItem('shop_admin_password') || 'мой_секретный_пароль_123'</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4 border border-red-100">
                    <p className="font-semibold text-red-700 mb-2">3. Домен в index.html</p>
                    <p className="text-sm text-gray-600 mb-2">В файле <code className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-mono text-xs">index.html</code> замените <code className="bg-red-100 px-2 py-0.5 rounded text-red-700 font-mono text-xs">your-domain.com</code> на ваш реальный домен:</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-xs">
                      <p className="text-red-400">❌ &lt;link rel="canonical" href="https://your-domain.com/" /&gt;</p>
                      <p className="text-green-400">✅ &lt;link rel="canonical" href="https://myshop.ru/" /&gt;</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <p className="font-bold text-amber-800 text-lg mb-3"><i className="fas fa-lightbulb mr-2"></i>РЕКОМЕНДУЕТСЯ ПРОВЕРИТЬ:</p>
                <div className="space-y-3">
                  {[
                    { num: 1, text: 'SEO-настройки: вкладка «🔍 SEO сайта» — заполните Title, Description, Keywords' },
                    { num: 2, text: 'Товары: добавьте реальные товары с фото и описаниями' },
                    { num: 3, text: 'Категории: создайте нужные категории с SEO-тегами' },
                    { num: 4, text: 'Тест: нажмите «Купить» на любом товаре — должен открыться ваш Telegram бот' },
                    { num: 5, text: 'Мобильная версия: проверьте сайт на телефоне' },
                    { num: 6, text: 'Скорость: проверьте на pagespeed.web.dev (должно быть 90+ баллов)' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-6 h-6 bg-amber-200 text-amber-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{item.num}</span>
                      <span className="text-sm">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>После всех изменений:</strong> пересоберите проект (<code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">npm run build</code>) и загрузите новую версию на сервер.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 14: ФИНАЛЬНЫЙ ЧЕК-ЛИСТ ===== */}
          <div id="step-19" className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h3 className="text-xl font-bold mb-4"><i className="fas fa-clipboard-check mr-2"></i>Финальный чек-лист запуска</h3>
            <div className="space-y-2">
              {[
                '✅ Создан Telegram бот через @BotFather',
                '✅ Ссылка на бота настроена в админ-панели',
                '✅ Пароль админки изменён с admin123 на свой',
                '✅ Куплен домен (reg.ru / namecheap / cloudflare)',
                '✅ Выбран хостинг (GitHub Pages / Netlify / Beget)',
                '✅ Сайт загружен на сервер (папка dist/)',
                '✅ Домен привязан к хостингу (DNS-записи)',
                '✅ SSL-сертификат активен (https://)',
                '✅ Домен в index.html заменён на реальный',
                '✅ Товары и категории добавлены',
                '✅ SEO-теги прописаны для каждого товара',
                '✅ SEO-теги прописаны для каждой категории',
                '✅ Глобальные SEO-настройки заполнены',
                '✅ Сайт добавлен в Яндекс.Вебмастер',
                '✅ Сайт добавлен в Google Search Console',
                '✅ Подключена Яндекс.Метрика / Google Analytics',
                '✅ Проверена мобильная версия',
                '✅ Проверена скорость загрузки (PageSpeed 90+)',
                '✅ Протестирована кнопка «Купить» — открывает бота',
              ].map((item, i) => <p key={i} className="text-sm text-white/90">{item}</p>)}
            </div>
          </div>

          <div className="text-center pb-8">
            <button onClick={() => setShowInstruction(false)} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-200"><i className="fas fa-arrow-left mr-2"></i>Вернуться к каталогу</button>
          </div>
        </div>
      </div>
    )
  }

  // ===== MAIN CATALOG =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center"><i className="fas fa-store text-white text-lg"></i></div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">ShopBot</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"><i className="fas fa-check-circle mr-1"></i>Админ</span>}
            <button onClick={() => { if (isAdmin) { setShowAdmin(!showAdmin) } else { setShowPasswordModal(true) } }} className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium"><i className="fas fa-cog mr-2"></i>{isAdmin ? 'Панель' : 'Админ'}</button>
          </div>
        </div>
      </header>

      {!showAdmin && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Наши <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">товары</span></h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Выберите товар и нажмите «Купить» — заказ оформляется через Telegram бот мгновенно</p>
          </div>
        </section>
      )}

      {/* ===== ADMIN PANEL ===== */}
      {showAdmin && isAdmin && (
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900"><i className="fas fa-shield-halved text-violet-600 mr-2"></i>Панель управления</h2>
              <div className="flex gap-2">
                <button onClick={() => setIsAdmin(false)} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-sm"><i className="fas fa-sign-out-alt mr-1"></i>Выйти</button>
                <button onClick={() => setShowAdmin(false)} className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm"><i className="fas fa-arrow-left mr-1"></i>К каталогу</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 bg-white rounded-xl p-2 border border-violet-100">
              {[
                { id: 'products' as const, label: '📦 Товары', icon: 'fa-box' },
                { id: 'categories' as const, label: '🏷 Категории', icon: 'fa-tags' },
                { id: 'seo' as const, label: '🔍 SEO сайта', icon: 'fa-magnifying-glass-chart' },
                { id: 'settings' as const, label: '⚙️ Настройки', icon: 'fa-cog' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setAdminTab(tab.id)} className={`flex-1 min-w-[120px] px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${adminTab === tab.id ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-violet-50'}`}>
                  <i className={`fas ${tab.icon} mr-1.5`}></i>{tab.label}
                </button>
              ))}
            </div>

            {/* TAB: Products */}
            {adminTab === 'products' && (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-plus-circle text-violet-600 mr-2"></i>Добавить товар</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Название товара *" className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="Цена (₽) *" className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                      <option value="">Выберите категорию *</option>
                      {categories.filter(c => c.name !== 'Все товары').map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <input type="text" value={newProduct.image} onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })} placeholder="URL фото (необязательно)" className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <input type="text" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Описание" className="md:col-span-2 px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  </div>

                  {/* SEO Fields */}
                  <div className="mt-5 pt-5 border-t border-violet-100">
                    <p className="font-semibold text-green-700 mb-3"><i className="fas fa-magnifying-glass-chart mr-2"></i>SEO для поиска (необязательно — заполнится автоматически)</p>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">SEO Title (заголовок для поисковика, 50-60 символов)</label>
                        <input type="text" value={newProduct.seoTitle} onChange={(e) => setNewProduct({ ...newProduct, seoTitle: e.target.value })} placeholder="Купить [товар] | [категория] — ShopBot" className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">SEO Description (описание для поисковика, 150-160 символов)</label>
                        <textarea value={newProduct.seoDescription} onChange={(e) => setNewProduct({ ...newProduct, seoDescription: e.target.value })} placeholder="Купить [товар] быстро и безопасно. Описание преимуществ..." rows={2} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">SEO Keywords (ключевые слова через запятую)</label>
                        <input type="text" value={newProduct.seoKeywords} onChange={(e) => setNewProduct({ ...newProduct, seoKeywords: e.target.value })} placeholder="купить товар, товар купить, товар недорого" className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                      </div>
                    </div>
                  </div>

                  <button onClick={handleAddProduct} className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"><i className="fas fa-plus mr-2"></i>Добавить товар</button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-list text-violet-600 mr-2"></i>Все товары ({products.length})</h3>
                  <div className="space-y-3">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        {product.image ? <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" /> : <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}><i className={`fas ${getCategoryIcon(product.category)} text-white`}></i></div>}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.category} • {product.price}₽</p>
                          {product.seoTitle && <p className="text-xs text-green-600 truncate mt-0.5"><i className="fas fa-magnifying-glass mr-1"></i>{product.seoTitle}</p>}
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setEditingProduct(product)} className="px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm transition-all"><i className="fas fa-edit"></i></button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all"><i className="fas fa-trash"></i></button>
                        </div>
                      </div>
                    ))}
                    {products.length === 0 && <p className="text-center text-gray-400 py-8">Товаров пока нет</p>}
                  </div>
                </div>
              </>
            )}

            {/* TAB: Categories */}
            {adminTab === 'categories' && (
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-tags text-violet-600 mr-2"></i>Категории</h3>
                <div className="flex gap-3 mb-6 flex-wrap">
                  <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Название категории" className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <button onClick={handleAddCategory} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"><i className="fas fa-plus mr-1"></i>Добавить</button>
                </div>
                <div className="space-y-3">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900">{cat.name}</p>
                        {cat.seoTitle && <p className="text-xs text-green-600 truncate mt-0.5"><i className="fas fa-magnifying-glass mr-1"></i>{cat.seoTitle}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{products.filter(p => p.category === cat.name).length} товаров</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setEditingCategory(cat)} className="px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm transition-all"><i className="fas fa-edit"></i></button>
                        {cat.id !== '1' && <button onClick={() => handleDeleteCategory(cat.id)} className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all"><i className="fas fa-trash"></i></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: Global SEO */}
            {adminTab === 'seo' && (
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2"><i className="fas fa-magnifying-glass-chart text-violet-600 mr-2"></i>SEO-настройки сайта</h3>
                <p className="text-sm text-gray-500 mb-5">Эти теги используются для главной страницы и когда не выбрана конкретная категория</p>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      <i className="fas fa-heading text-violet-500 mr-1"></i>Название сайта (Title)
                      <span className="text-xs text-gray-400 ml-2">50-60 символов</span>
                    </label>
                    <input type="text" value={globalSEO.siteTitle} onChange={(e) => setGlobalSEO({ ...globalSEO, siteTitle: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                    <p className="text-xs text-gray-400 mt-1">Отображается во вкладке браузера и как заголовок в поиске</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      <i className="fas fa-align-left text-violet-500 mr-1"></i>Описание сайта (Description)
                      <span className="text-xs text-gray-400 ml-2">150-160 символов</span>
                    </label>
                    <textarea value={globalSEO.siteDescription} onChange={(e) => setGlobalSEO({ ...globalSEO, siteDescription: e.target.value })} rows={3} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                    <p className="text-xs text-gray-400 mt-1">Текст под ссылкой в результатах поиска</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      <i className="fas fa-key text-violet-500 mr-1"></i>Ключевые слова (Keywords)
                      <span className="text-xs text-gray-400 ml-2">через запятую</span>
                    </label>
                    <textarea value={globalSEO.siteKeywords} onChange={(e) => setGlobalSEO({ ...globalSEO, siteKeywords: e.target.value })} rows={3} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none" />
                    <p className="text-xs text-gray-400 mt-1">Общие ключевые слова для всего сайта</p>
                  </div>

                  <button onClick={handleSaveGlobalSEO} className={`px-6 py-2 rounded-lg transition-all font-medium ${savedSEO ? 'bg-green-500 text-white' : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white'}`}>
                    {savedSEO ? <><i className="fas fa-check mr-2"></i>Сохранено!</> : <><i className="fas fa-save mr-2"></i>Сохранить SEO-настройки</>}
                  </button>
                </div>

                {/* Preview */}
                <div className="mt-6 pt-6 border-t border-violet-100">
                  <p className="text-sm font-medium text-gray-700 mb-3"><i className="fas fa-eye text-violet-500 mr-1"></i>Как будет выглядеть в Google:</p>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <p className="text-blue-700 text-lg hover:underline cursor-pointer">{globalSEO.siteTitle}</p>
                    <p className="text-green-700 text-sm">your-domain.com</p>
                    <p className="text-gray-600 text-sm mt-1">{globalSEO.siteDescription}</p>
                  </div>
                </div>

                {/* SEO Tips */}
                <div className="mt-6 pt-6 border-t border-violet-100">
                  <p className="text-sm font-medium text-gray-700 mb-3"><i className="fas fa-lightbulb text-amber-500 mr-1"></i>Советы по SEO:</p>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>• Title должен содержать главный ключ в начале</p>
                    <p>• Description — с призывом к действию («Купить», «Заказать», «Узнать»)</p>
                    <p>• Keywords — 5-10 ключевых фраз через запятую</p>
                    <p>• Не используйте одинаковые ключи для разных страниц</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Settings */}
            {adminTab === 'settings' && (
              <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-cog text-violet-600 mr-2"></i>Настройки</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block"><i className="fab fa-telegram text-violet-500 mr-1"></i>Ссылка на Telegram бот</label>
                    <div className="flex gap-3 flex-wrap">
                      <input type="text" value={botLink} onChange={(e) => { setBotLink(e.target.value); setSavedBotLink(false) }} placeholder="https://t.me/your_bot?start=buy" className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                      <button onClick={() => { localStorage.setItem('shop_bot_link', botLink); setSavedBotLink(true); setTimeout(() => setSavedBotLink(false), 2000) }} className={`px-6 py-2 rounded-lg transition-all ${savedBotLink ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                        {savedBotLink ? <><i className="fas fa-check mr-1"></i>Сохранено!</> : 'Сохранить'}
                      </button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-violet-100">
                    <p className="text-sm font-medium text-gray-700 mb-2"><i className="fas fa-shield-halved text-violet-500 mr-1"></i>Безопасность</p>
                    <p className="text-sm text-gray-500 mb-2">Защита от накрутки: макс. {MAX_CLICKS} нажатий «Купить» в минуту</p>
                    <p className="text-sm text-gray-500">Пароль админки: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-xs">admin123</code> (по умолчанию)</p>
                  </div>

                  <div className="pt-4 border-t border-violet-100">
                    <p className="text-sm font-medium text-red-700 mb-2"><i className="fas fa-trash mr-1"></i>Сброс данных</p>
                    <button onClick={() => { if (confirm('Удалить ВСЕ данные? Это действие необратимо!')) { localStorage.clear(); window.location.reload() } }} className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all">Сбросить все данные</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-lg font-semibold mb-4"><i className="fas fa-edit text-violet-600 mr-2"></i>Редактировать товар</h3>
            <div className="space-y-3">
              <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} placeholder="Название" className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} placeholder="Цена" className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                {categories.filter(c => c.name !== 'Все товары').map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="text" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} placeholder="URL фото" className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <input type="text" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} placeholder="Описание" className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />

              <div className="pt-3 border-t border-violet-100">
                <p className="font-semibold text-green-700 mb-3 text-sm"><i className="fas fa-magnifying-glass-chart mr-2"></i>SEO для поиска</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Title</label>
                    <input type="text" value={editingProduct.seoTitle} onChange={(e) => setEditingProduct({ ...editingProduct, seoTitle: e.target.value })} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Description</label>
                    <textarea value={editingProduct.seoDescription} onChange={(e) => setEditingProduct({ ...editingProduct, seoDescription: e.target.value })} rows={2} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Keywords (через запятую)</label>
                    <input type="text" value={editingProduct.seoKeywords} onChange={(e) => setEditingProduct({ ...editingProduct, seoKeywords: e.target.value })} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpdateProduct} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all">Сохранить</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg my-8">
            <h3 className="text-lg font-semibold mb-4"><i className="fas fa-tags text-violet-600 mr-2"></i>Редактировать категорию: {editingCategory.name}</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Название категории</label>
                <input type="text" value={editingCategory.name} onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>

              <div className="pt-3 border-t border-violet-100">
                <p className="font-semibold text-green-700 mb-3 text-sm"><i className="fas fa-magnifying-glass-chart mr-2"></i>SEO для этой категории</p>
                <p className="text-xs text-gray-500 mb-3">Когда пользователь выберет эту категорию — эти теги покажутся в поиске</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Title (заголовок для поисковика)</label>
                    <input type="text" value={editingCategory.seoTitle} onChange={(e) => setEditingCategory({ ...editingCategory, seoTitle: e.target.value })} placeholder="Купить [категория] онлайн — ShopBot" className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Description (описание для поисковика)</label>
                    <textarea value={editingCategory.seoDescription} onChange={(e) => setEditingCategory({ ...editingCategory, seoDescription: e.target.value })} placeholder="Купить [категория] быстро и безопасно. Лучшие цены, доставка через Telegram." rows={2} className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm resize-none" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">SEO Keywords (ключевые слова через запятую)</label>
                    <input type="text" value={editingCategory.seoKeywords} onChange={(e) => setEditingCategory({ ...editingCategory, seoKeywords: e.target.value })} placeholder="купить категория, категория купить, категория онлайн" className="w-full px-4 py-2 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 text-sm" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpdateCategory} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all">Сохранить</button>
              <button onClick={() => setEditingCategory(null)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">Отмена</button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2"><i className="fas fa-lock text-violet-600 mr-2"></i>Вход в админ-панель</h3>
            <p className="text-sm text-gray-500 mb-4">Введите пароль для доступа</p>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()} placeholder="Пароль" className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={handleAdminLogin} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all">Войти</button>
              <button onClick={() => { setShowPasswordModal(false); setAdminPassword('') }} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">Отмена</button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">Пароль по умолчанию: admin123</p>
          </div>
        </div>
      )}

      {/* Catalog */}
      {!showAdmin && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200' : 'bg-white text-gray-600 hover:bg-violet-50 border border-violet-100'}`}>{cat.name}</button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 group">
                  <div className="h-48 relative overflow-hidden">
                    {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" /> : <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}><i className={`fas ${getCategoryIcon(product.category)} text-white text-4xl opacity-80`}></i></div>}
                    <div className="absolute top-3 right-3"><span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-violet-700">{product.price.toLocaleString()}₽</span></div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                    {product.description && <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>}
                    <button onClick={() => handleBuy(product)} className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 active:scale-95"><i className="fab fa-telegram"></i>Купить</button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <i className="fas fa-box-open text-5xl text-violet-200 mb-4"></i>
                <p className="text-gray-400 text-lg">В этой категории пока нет товаров</p>
              </div>
            )}
          </div>
        </section>
      )}

      <footer className="bg-white border-t border-violet-100 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center"><i className="fas fa-store text-white text-sm"></i></div>
            <span className="font-bold text-gray-900">ShopBot</span>
          </div>
          <p className="text-sm text-gray-400">Покупки через Telegram бот — быстро и удобно</p>
          <button onClick={() => setShowInstruction(true)} className="mt-3 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-all"><i className="fas fa-book-open"></i>Полная инструкция (SEO через админку)</button>
          <p className="text-xs text-gray-300 mt-2">© 2024 ShopBot</p>
        </div>
      </footer>
    </div>
  )
}

export default App
