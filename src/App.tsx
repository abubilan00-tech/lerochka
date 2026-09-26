import { useState, useEffect } from 'react'

// Types
interface Product {
  id: string
  name: string
  price: number
  category: string
  image: string
  description: string
}

interface Category {
  id: string
  name: string
}

const defaultCategories: Category[] = [
  { id: '1', name: 'Все товары' },
  { id: '2', name: 'Электроника' },
  { id: '3', name: 'Одежда' },
  { id: '4', name: 'Аксессуары' },
]

const defaultProducts: Product[] = [
  { id: '1', name: 'Беспроводные наушники', price: 2990, category: 'Электроника', image: '', description: 'Качественные беспроводные наушники с шумоподавлением' },
  { id: '2', name: 'Смарт-часы', price: 4990, category: 'Электроника', image: '', description: 'Умные часы с фитнес-трекером' },
  { id: '3', name: 'Худи оверсайз', price: 3490, category: 'Одежда', image: '', description: 'Стильное худи свободного кроя' },
  { id: '4', name: 'Кожаный чехол', price: 1290, category: 'Аксессуары', image: '', description: 'Премиальный кожаный чехол для телефона' },
  { id: '5', name: 'Портативная колонка', price: 3990, category: 'Электроника', image: '', description: 'Мощная Bluetooth колонка' },
  { id: '6', name: 'Рюкзак городской', price: 2490, category: 'Аксессуары', image: '', description: 'Удобный городской рюкзак с USB портом' },
]

const TELEGRAM_BOT_LINK = 'https://t.me/your_bot?start=buy'
const MAX_CLICKS = 10
const CLICK_WINDOW = 60000

function App() {
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shop_products')
    return saved ? JSON.parse(saved) : defaultProducts
  })
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('shop_categories')
    return saved ? JSON.parse(saved) : defaultCategories
  })
  const [selectedCategory, setSelectedCategory] = useState('Все товары')
  const [showAdmin, setShowAdmin] = useState(false)
  const [adminPassword, setAdminPassword] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [clickCounts, setClickCounts] = useState<number[]>([])
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showInstruction, setShowInstruction] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', description: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [botLink, setBotLink] = useState(() => localStorage.getItem('shop_bot_link') || TELEGRAM_BOT_LINK)
  const [savedBotLink, setSavedBotLink] = useState(false)

  useEffect(() => { localStorage.setItem('shop_products', JSON.stringify(products)) }, [products])
  useEffect(() => { localStorage.setItem('shop_categories', JSON.stringify(categories)) }, [categories])
  useEffect(() => { localStorage.setItem('shop_bot_link', botLink) }, [botLink])

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
    const product: Product = { id: Date.now().toString(), name: newProduct.name, price: Number(newProduct.price), category: newProduct.category, image: newProduct.image, description: newProduct.description }
    setProducts([...products, product])
    setNewProduct({ name: '', price: '', category: '', image: '', description: '' })
  }

  const handleUpdateProduct = () => { if (!editingProduct) return; setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p)); setEditingProduct(null) }
  const handleDeleteProduct = (id: string) => { if (confirm('Удалить товар?')) setProducts(products.filter(p => p.id !== id)) }
  const handleAddCategory = () => { if (!newCategory) return; if (categories.find(c => c.name === newCategory)) { alert('Категория уже существует'); return }; setCategories([...categories, { id: Date.now().toString(), name: newCategory }]); setNewCategory('') }
  const handleDeleteCategory = (id: string) => { if (id === '1') { alert('Нельзя удалить "Все товары"'); return }; if (confirm('Удалить?')) setCategories(categories.filter(c => c.id !== id)) }

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
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-store text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">ShopBot</h1>
            </div>
            <button onClick={() => setShowInstruction(false)} className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium">
              <i className="fas fa-arrow-left mr-2"></i>К каталогу
            </button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-10">
          {/* Title */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl mb-4">
              <i className="fas fa-book-open text-white text-2xl"></i>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Полная <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">инструкция</span>
            </h2>
            <p className="text-gray-500 text-lg">От создания бота до запуска сайта с SEO-оптимизацией</p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-list-ol text-violet-600 mr-2"></i>Содержание</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                { num: 1, title: 'Создание Telegram бота', icon: 'fa-robot' },
                { num: 2, title: 'Получение ссылки на бота', icon: 'fa-link' },
                { num: 3, title: 'Вход в админ-панель', icon: 'fa-lock' },
                { num: 4, title: 'Настройка ссылки бота', icon: 'fa-cog' },
                { num: 5, title: 'Добавление категорий', icon: 'fa-tags' },
                { num: 6, title: 'Добавление товаров', icon: 'fa-plus-circle' },
                { num: 7, title: 'Редактирование и удаление', icon: 'fa-edit' },
                { num: 8, title: 'Защита и безопасность', icon: 'fa-shield-halved' },
                { num: 9, title: 'Покупка домена', icon: 'fa-globe' },
                { num: 10, title: 'Выбор хостинга / сервера', icon: 'fa-server' },
                { num: 11, title: 'Загрузка сайта на сервер', icon: 'fa-cloud-arrow-up' },
                { num: 12, title: 'Подключение домена и SSL', icon: 'fa-lock' },
                { num: 13, title: 'SEO и семантическое ядро', icon: 'fa-magnifying-glass-chart' },
              ].map(item => (
                <a key={item.num} href={`#step-${item.num}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all group">
                  <span className="w-8 h-8 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center text-violet-600 text-sm font-bold transition-all">{item.num}</span>
                  <span className="text-gray-700 group-hover:text-violet-700 text-sm font-medium transition-all">
                    <i className={`fas ${item.icon} mr-2 text-violet-400`}></i>{item.title}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* ===== STEP 1 ===== */}
          <div id="step-1" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">1</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-robot text-violet-600 mr-2"></i>Создание Telegram бота</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Telegram бот — это ваш «продавец», через которого клиенты будут оформлять заказы.</p>
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Пошаговая инструкция:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Откройте Telegram и найдите бота @BotFather',
                    'Нажмите «Start» / «Запустить»',
                    'Отправьте команду /newbot',
                    'Введите имя бота (например: Мой Магазин)',
                    'Введите username бота (должен заканчиваться на bot, например: my_shop_bot)',
                    'BotFather пришлёт токен — сохраните его! Выглядит так: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz'
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-lightbulb mr-2"></i><strong>Совет:</strong> Username бота должен быть уникальным. Если занят — попробуйте другой вариант.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 2 ===== */}
          <div id="step-2" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">2</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-link text-violet-600 mr-2"></i>Получение ссылки на бота</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Ссылка на вашего бота формируется по шаблону:</p>
              <div className="bg-gray-900 rounded-xl p-5 font-mono text-center"><p className="text-green-400 text-lg">https://t.me/<span className="text-yellow-300">ваш_username</span></p></div>
              <p>Для удобного перехода с параметром:</p>
              <div className="bg-gray-900 rounded-xl p-5 font-mono text-center"><p className="text-green-400 text-lg">https://t.me/my_shop_bot?start=buy</p></div>
            </div>
          </div>

          {/* ===== STEP 3 ===== */}
          <div id="step-3" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">3</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-lock text-violet-600 mr-2"></i>Вход в админ-панель</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <ol className="space-y-3 ml-1">
                  {[
                    'Нажмите кнопку «⚙ Админ» в правом верхнем углу сайта',
                    'Введите пароль: admin123',
                    'Нажмите «Войти»'
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-exclamation-triangle mr-2"></i><strong>Важно:</strong> Смените пароль по умолчанию на свой!</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 4 ===== */}
          <div id="step-4" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">4</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-cog text-violet-600 mr-2"></i>Настройка ссылки на Telegram бота</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>В админ-панели найдите блок «📨 Ссылка на Telegram бот», вставьте ссылку и нажмите «Сохранить».</p>
              <div className="bg-gray-900 rounded-xl p-4 font-mono text-center"><p className="text-green-400">https://t.me/my_shop_bot?start=buy</p></div>
            </div>
          </div>

          {/* ===== STEP 5 ===== */}
          <div id="step-5" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">5</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-tags text-violet-600 mr-2"></i>Добавление категорий</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>В блоке «🏷 Категории» введите название и нажмите «Добавить». Например: Обувь, Косметика, Игрушки.</p>
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm"><i className="fas fa-info-circle mr-2"></i>Категория «Все товары» — системная, её нельзя удалить.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 6 ===== */}
          <div id="step-6" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">6</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-plus-circle text-violet-600 mr-2"></i>Добавление товаров</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <div className="space-y-3">
                  {[
                    { icon: '📦', title: 'Название товара *', desc: 'Короткое и понятное имя' },
                    { icon: '💰', title: 'Цена (₽) *', desc: 'Цена в рублях, только цифры' },
                    { icon: '🏷', title: 'Категория *', desc: 'Выберите из списка' },
                    { icon: '🖼', title: 'URL фото', desc: 'Прямая ссылка на изображение (необязательно)' },
                    { icon: '📝', title: 'Описание', desc: 'Краткое описание (необязательно)' },
                  ].map((field, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="text-violet-600 font-bold shrink-0">{field.icon}</span>
                      <div><strong>{field.title}</strong><p className="text-sm text-gray-500">{field.desc}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm"><i className="fas fa-image mr-2"></i><strong>Где взять фото?</strong> Загрузите на imgur.com или postimages.org и скопируйте прямую ссылку.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 7 ===== */}
          <div id="step-7" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">7</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-edit text-violet-600 mr-2"></i>Редактирование и удаление</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-2"><i className="fas fa-pen mr-2"></i>Редактировать</p>
                <p className="text-sm text-gray-600">Нажмите ✏️ рядом с товаром. Измените данные и нажмите «Сохранить».</p>
              </div>
              <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                <p className="font-semibold text-red-800 mb-2"><i className="fas fa-trash mr-2"></i>Удалить</p>
                <p className="text-sm text-gray-600">Нажмите 🗑 рядом с товаром. Подтвердите удаление.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 8 ===== */}
          <div id="step-8" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">8</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-shield-halved text-violet-600 mr-2"></i>Защита и безопасность</h3>
            </div>
            <div className="space-y-3">
              <div className="flex gap-4 items-start p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center shrink-0"><i className="fas fa-clock text-green-700"></i></div>
                <div><p className="font-semibold text-green-800">Защита от накрутки кликов</p><p className="text-sm text-green-700">Максимум 10 нажатий «Купить» в минуту</p></div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-xl border border-blue-100">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center shrink-0"><i className="fas fa-lock text-blue-700"></i></div>
                <div><p className="font-semibold text-blue-800">Пароль на админ-панель</p><p className="text-sm text-blue-700">Доступ к управлению защищён паролем</p></div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-violet-50 rounded-xl border border-violet-100">
                <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center shrink-0"><i className="fas fa-database text-violet-700"></i></div>
                <div><p className="font-semibold text-violet-800">Локальное хранение</p><p className="text-sm text-violet-700">Данные сохраняются в localStorage браузера</p></div>
              </div>
              <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center shrink-0"><i className="fas fa-server text-amber-700"></i></div>
                <div><p className="font-semibold text-amber-800">Защита от DDoS</p><p className="text-sm text-amber-700">Подключите Cloudflare для CDN-защиты</p></div>
              </div>
            </div>
          </div>

          {/* ===== STEP 9: ПОКУПКА ДОМЕНА ===== */}
          <div id="step-9" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">9</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-globe text-violet-600 mr-2"></i>Покупка домена</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Домен — это адрес вашего сайта в интернете (например: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">myshop.ru</code>).</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-store mr-2"></i>Где купить домен:</p>
                <div className="space-y-3">
                  {[
                    { name: 'REG.RU', url: 'reg.ru', price: 'от 199₽/год (.ru)', note: 'Крупный российский регистратор' },
                    { name: 'Beget', url: 'beget.com', price: 'от 299₽/год (.ru)', note: 'Хостинг + домен в одном месте' },
                    { name: 'Namecheap', url: 'namecheap.com', price: 'от $8.88/год (.com)', note: 'Популярный международный регистратор' },
                    { name: 'Cloudflare Registrar', url: 'cloudflare.com', price: 'по себестоимости', note: 'Домены без наценки + бесплатная защита' },
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
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Как купить:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зайдите на сайт регистратора (например, reg.ru)',
                    'В поисковой строке введите желаемое имя домена',
                    'Проверьте доступность — если свободно, добавьте в корзину',
                    'Зарегистрируйтесь / войдите в аккаунт',
                    'Заполните данные (ФИО, email, телефон)',
                    'Оплатите (карта, СБП, электронные кошельки)',
                    'Домен появится в вашем личном кабинете'
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span>{step}</span>
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

          {/* ===== STEP 10: ХОСТИНГ ===== */}
          <div id="step-10" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">10</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-server text-violet-600 mr-2"></i>Выбор хостинга / сервера</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Хостинг — это место, где хранятся файлы вашего сайта. Наш сайт — статический (HTML/CSS/JS), поэтому подойдёт любой хостинг.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-star mr-2"></i>Варианты хостинга:</p>
                <div className="space-y-3">
                  {[
                    { name: '🆓 Бесплатные', items: ['GitHub Pages — бесплатно, идеально для статических сайтов', 'Netlify — бесплатный тариф, автодеплой из Git', 'Vercel — быстрый деплой, бесплатный SSL', 'Cloudflare Pages — бесплатно + CDN + защита от DDoS'] },
                    { name: '💰 Платные (Россия)', items: ['Beget — от 0₽/мес (есть бесплатный тариф)', 'Timeweb — от 199₽/мес, простая панель', 'REG.RU Хостинг — от 180₽/мес'] },
                    { name: '🌍 Платные (международные)', items: ['Hostinger — от $2.99/мес, быстрый', 'DigitalOcean — от $4/мес, VPS для продвинутых', 'AWS / Google Cloud — для масштабных проектов'] },
                  ].map((group, i) => (
                    <div key={i} className="bg-white rounded-lg p-4 border border-violet-100">
                      <p className="font-semibold text-gray-800 mb-2">{group.name}</p>
                      <ul className="space-y-1">
                        {group.items.map((item, j) => (
                          <li key={j} className="text-sm text-gray-600 flex gap-2"><i className="fas fa-check text-green-500 mt-1 shrink-0"></i>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Рекомендация:</strong> Для начала используйте <strong>GitHub Pages</strong> или <strong>Netlify</strong> — бесплатно, быстро, с автоматическим SSL.</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 11: ЗАГРУЗКА НА СЕРВЕР ===== */}
          <div id="step-11" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">11</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-cloud-arrow-up text-violet-600 mr-2"></i>Загрузка сайта на сервер</h3>
            </div>
            <div className="space-y-4 text-gray-600">

              {/* Вариант A */}
              <div className="bg-white rounded-xl p-5 border-2 border-violet-200">
                <p className="font-bold text-violet-800 mb-3 text-lg">Вариант A: GitHub Pages (рекомендуется)</p>
                <div className="bg-violet-50 rounded-lg p-4 mb-3">
                  <p className="font-semibold text-violet-700 mb-2">Что нужно:</p>
                  <ul className="text-sm text-violet-600 space-y-1">
                    <li>• Аккаунт на <strong>github.com</strong> (бесплатно)</li>
                    <li>• Файлы сайта (папка <code className="bg-violet-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/</code> после сборки)</li>
                  </ul>
                </div>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зарегистрируйтесь на github.com',
                    'Создайте новый репозиторий (кнопка «New»)',
                    'Назовите его, например: my-shop-site',
                    'Загрузите файлы из папки dist/ в репозиторий',
                    'Зайдите в Settings → Pages',
                    'В разделе «Source» выберите ветку main и папку / (root)',
                    'Нажмите Save — через 1-2 минуты сайт будет доступен по адресу: https://ваш-username.github.io/my-shop-site/',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Вариант B */}
              <div className="bg-white rounded-xl p-5 border-2 border-purple-200">
                <p className="font-bold text-purple-800 mb-3 text-lg">Вариант B: Netlify (drag & drop)</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Зарегистрируйтесь на netlify.com',
                    'После входа вы увидите область для загрузки',
                    'Перетащите папку dist/ прямо в браузер',
                    'Через 30 секунд сайт будет доступен по ссылке вида: https://random-name-123.netlify.app',
                    'Можно изменить имя сайта в настройках',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Вариант C */}
              <div className="bg-white rounded-xl p-5 border-2 border-indigo-200">
                <p className="font-bold text-indigo-800 mb-3 text-lg">Вариант C: Обычный хостинг (FTP)</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Купите хостинг (Beget, Timeweb и т.д.)',
                    'В панели хостинга найдите данные FTP (адрес, логин, пароль)',
                    'Скачайте FTP-клиент: FileZilla (бесплатно)',
                    'Подключитесь к серверу через FileZilla',
                    'Загрузите файлы из папки dist/ в папку public_html/ на сервере',
                    'Сайт доступен по вашему домену',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm"><i className="fas fa-check-circle mr-2"></i><strong>Важно:</strong> Загружать нужно содержимое папки <code className="bg-green-100 px-1.5 py-0.5 rounded font-mono text-xs">dist/</code>, а не саму папку!</p>
              </div>
            </div>
          </div>

          {/* ===== STEP 12: ДОМЕН + SSL ===== */}
          <div id="step-12" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">12</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-lock text-violet-600 mr-2"></i>Подключение домена и SSL</h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Теперь нужно привязать ваш купленный домен к сайту на хостинге.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-link mr-2"></i>Подключение домена к GitHub Pages:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'В репозитории: Settings → Pages → Custom domain',
                    'Введите ваш домен: myshop.ru',
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
              </div>

              <div className="bg-white rounded-xl p-5 border-2 border-purple-200">
                <p className="font-semibold text-purple-800 mb-3"><i className="fas fa-link mr-2"></i>Подключение домена к Netlify:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Netlify → Domain settings → Add custom domain',
                    'Введите ваш домен',
                    'Netlify покажет нужные DNS-записи',
                    'Пропишите их у регистратора домена',
                    'Ожидайте 5-30 минут (иногда до 24 часов)',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-200 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
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

          {/* ===== STEP 13: SEO ===== */}
          <div id="step-13" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">13</span>
              <h3 className="text-xl font-bold text-gray-900"><i className="fas fa-magnifying-glass-chart text-violet-600 mr-2"></i>SEO и семантическое ядро</h3>
            </div>
            <div className="space-y-5 text-gray-600">

              {/* Что такое SEO */}
              <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-5 border border-violet-100">
                <p className="font-bold text-violet-800 text-lg mb-2">Что такое SEO?</p>
                <p className="text-sm text-gray-600">SEO (Search Engine Optimization) — это оптимизация сайта для поисковых систем (Google, Яндекс). Цель — чтобы ваш сайт появлялся высоко в результатах поиска по нужным запросам.</p>
              </div>

              {/* Что такое семантическое ядро */}
              <div className="bg-white rounded-xl p-5 border-2 border-violet-200">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-sitemap text-violet-600 mr-2"></i>Что такое семантическое ядро?</p>
                <p className="text-sm text-gray-600 mb-4">
                  <strong>Семантическое ядро</strong> — это полный набор ключевых слов и фраз, по которым ваш сайт должен находиться в поиске. Ключевые слова при поиске по сайту или в интернете называют <strong>поисковыми запросами</strong> или просто «ключами».
                </p>
                <div className="bg-violet-50 rounded-lg p-4">
                  <p className="font-semibold text-violet-700 mb-2">Структура семантического ядра:</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-violet-600 rounded-full"></span><strong>Высокочастотные (ВЧ)</strong> — популярные запросы (1000+ запросов/мес)</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-purple-500 rounded-full"></span><strong>Среднечастотные (СЧ)</strong> — 100-1000 запросов/мес</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-fuchsia-400 rounded-full"></span><strong>Низкочастотные (НЧ)</strong> — до 100 запросов/мес</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 bg-pink-300 rounded-full"></span><strong>Микрочастотные</strong> — очень узкие запросы (1-10/мес)</div>
                  </div>
                </div>
              </div>

              {/* Пример семантического ядра */}
              <div className="bg-white rounded-xl p-5 border-2 border-purple-200">
                <p className="font-bold text-purple-800 text-lg mb-3"><i className="fas fa-table text-purple-600 mr-2"></i>Пример семантического ядра для магазина</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-purple-50">
                        <th className="text-left p-2 rounded-tl-lg">Тип</th>
                        <th className="text-left p-2">Ключевой запрос</th>
                        <th className="text-left p-2 rounded-tr-lg">Конкуренция</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-50">
                      {[
                        { type: 'ВЧ', query: 'купить товары онлайн', comp: 'Высокая' },
                        { type: 'ВЧ', query: 'интернет магазин', comp: 'Очень высокая' },
                        { type: 'СЧ', query: 'магазин электроники онлайн', comp: 'Средняя' },
                        { type: 'СЧ', query: 'купить беспроводные наушники', comp: 'Средняя' },
                        { type: 'СЧ', query: 'купить смарт часы', comp: 'Средняя' },
                        { type: 'НЧ', query: 'купить худи оверсайз недорого', comp: 'Низкая' },
                        { type: 'НЧ', query: 'кожаный чехол для телефона купить', comp: 'Низкая' },
                        { type: 'НЧ', query: 'рюкзак с usb портом купить', comp: 'Низкая' },
                        { type: 'НЧ', query: 'портативная bluetooth колонка', comp: 'Низкая' },
                        { type: 'МЧ', query: 'купить товары через telegram бот', comp: 'Очень низкая' },
                        { type: 'МЧ', query: 'магазин с заказом через телеграм', comp: 'Очень низкая' },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-purple-50/50">
                          <td className="p-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${row.type === 'ВЧ' ? 'bg-violet-100 text-violet-700' : row.type === 'СЧ' ? 'bg-purple-100 text-purple-700' : row.type === 'НЧ' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-pink-100 text-pink-700'}`}>{row.type}</span></td>
                          <td className="p-2 font-mono text-xs">{row.query}</td>
                          <td className="p-2 text-xs">{row.comp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Как собрать семантическое ядро */}
              <div className="bg-white rounded-xl p-5 border-2 border-indigo-200">
                <p className="font-bold text-indigo-800 text-lg mb-3"><i className="fas fa-magnifying-glass text-indigo-600 mr-2"></i>Как собрать семантическое ядро</p>
                <div className="space-y-3">
                  {[
                    { tool: 'Яндекс.Вордстат', url: 'wordstat.yandex.ru', desc: 'Показывает частотность запросов в Яндексе. Вводите слово — видите сколько раз искали за месяц.' },
                    { tool: 'Google Keyword Planner', url: 'ads.google.com', desc: 'Бесплатный инструмент от Google для подбора ключевых слов. Нужен аккаунт Google Ads.' },
                    { tool: 'Key Collector', url: 'keycollector.ru', desc: 'Программа для автоматического сбора ключевых слов. Платная, но очень мощная.' },
                    { tool: 'Megaindex', url: 'megaindex.com', desc: 'Анализ конкурентов, подбор ключей, проверка позиций.' },
                    { tool: 'Serpstat', url: 'serpstat.com', desc: 'Комплексный SEO-инструмент: ключи, аналитика, аудит.' },
                    { tool: 'Бесплатные альтернативы', url: '', desc: 'Google Trends, Ubersuggest (бесплатная версия), AnswerThePublic, Keyword.io' },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start bg-indigo-50 rounded-lg p-3">
                      <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-indigo-700">{item.tool}</strong>
                          {item.url && <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">{item.url}</span>}
                        </div>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Пошаговый сбор */}
              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-bold text-violet-800 text-lg mb-3"><i className="fas fa-list-ol text-violet-600 mr-2"></i>Пошаговый сбор семантического ядра:</p>
                <ol className="space-y-3 ml-1">
                  {[
                    'Выпишите все товары и услуги вашего магазина',
                    'Для каждого товара подберите 5-10 вариантов запросов (как люди ищут)',
                    'Проверьте частотность в Яндекс.Вордстат',
                    'Добавьте синонимы и связанные запросы',
                    'Разделите ключи по группам (кластерам): каждый товар/категория — отдельный кластер',
                    'Отфильтруйте «мусор» — запросы, не относящиеся к вашему магазину',
                    'Приоритизируйте: начните с низкочастотных (меньше конкуренция)',
                    'Составьте итоговую таблицу семантического ядра',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Где размещать ключи */}
              <div className="bg-white rounded-xl p-5 border-2 border-green-200">
                <p className="font-bold text-green-800 text-lg mb-3"><i className="fas fa-map-pin text-green-600 mr-2"></i>Где размещать ключевые слова на сайте</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { place: '<title>', importance: 'Критически важно', desc: 'Заголовок вкладки браузера. 50-60 символов. Главный ключ — в начале.' },
                    { place: 'meta description', importance: 'Очень важно', desc: 'Описание в поиске. 150-160 символов. Включите ключ + призыв к действию.' },
                    { place: 'meta keywords', importance: 'Менее важно', desc: 'Список ключевых слов через запятую. Google не учитывает, Яндекс — частично.' },
                    { place: 'H1 заголовок', importance: 'Очень важно', desc: 'Главный заголовок страницы. Один на страницу. Содержит основной ключ.' },
                    { place: 'Текст страницы', importance: 'Важно', desc: 'Естественное вхождение ключей в описания товаров, категории.' },
                    { place: 'Alt у изображений', importance: 'Важно', desc: 'Описание картинок. Используйте ключевые слова для фото товаров.' },
                    { place: 'URL страницы', importance: 'Важно', desc: 'Человеко-понятный URL с ключом: /kupit-naushniki' },
                    { place: 'Open Graph теги', importance: 'Для соцсетей', desc: 'Заголовки для красивого отображения при шаринге в соцсетях.' },
                  ].map((item, i) => (
                    <div key={i} className="bg-green-50 rounded-lg p-3 border border-green-100">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="bg-green-200 text-green-800 px-2 py-0.5 rounded text-xs font-bold">{item.place}</code>
                      </div>
                      <p className="text-xs font-semibold text-green-700 mb-1">{item.importance}</p>
                      <p className="text-xs text-gray-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Примеры мета-тегов */}
              <div className="bg-gray-900 rounded-xl p-5">
                <p className="font-bold text-white text-sm mb-3"><i className="fas fa-code text-green-400 mr-2"></i>Примеры мета-тегов для нашего сайта:</p>
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <p className="text-gray-400 mb-1"># Title (заголовок вкладки)</p>
                    <p className="text-green-400">{'<title>ShopBot — Магазин товаров | Купить онлайн через Telegram</title>'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"># Description (описание в поиске)</p>
                    <p className="text-green-400 break-all">{'<meta name="description" content="ShopBot — каталог товаров с быстрой покупкой через Telegram. Электроника, одежда, аксессуары. Лучшие цены, мгновенный заказ." />'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1"># Keywords (ключевые слова)</p>
                    <p className="text-green-400 break-all">{'<meta name="keywords" content="купить товары онлайн, интернет магазин, telegram бот магазин, каталог товаров, заказать онлайн, магазин электроники" />'}</p>
                  </div>
                </div>
              </div>

              {/* Дополнительные SEO советы */}
              <div className="bg-white rounded-xl p-5 border-2 border-amber-200">
                <p className="font-bold text-amber-800 text-lg mb-3"><i className="fas fa-lightbulb text-amber-600 mr-2"></i>Дополнительные SEO-советы</p>
                <div className="space-y-3">
                  {[
                    { icon: 'fa-robot', title: 'Добавьте сайт в Яндекс.Вебмастер и Google Search Console', desc: 'Это ускорит индексацию. Отправьте sitemap.xml для быстрого сканирования.' },
                    { icon: 'fa-file-lines', title: 'Создайте sitemap.xml', desc: 'Файл со списком всех страниц сайта. Помогает поисковикам найти все страницы.' },
                    { icon: 'fa-file-contract', title: 'Создайте robots.txt', desc: 'Файл-инструкция для поисковых ботов. Указывает какие страницы можно индексировать.' },
                    { icon: 'fa-bolt', title: 'Скорость загрузки', desc: 'Оптимизируйте изображения, минифицируйте CSS/JS. Быстрые сайты ранжируются выше.' },
                    { icon: 'fa-mobile-screen', title: 'Мобильная версия', desc: 'Google и Яндекс учитывают мобильную адаптацию. Наш сайт полностью адаптивен!' },
                    { icon: 'fa-link', title: 'Внутренняя перелинковка', desc: 'Связывайте страницы между собой. Категории → товары, товары → похожие.' },
                    { icon: 'fa-pen-fancy', title: 'Контент', desc: 'Добавьте блог/статьи. Уникальный контент привлекает поисковый трафик.' },
                    { icon: 'fa-chart-line', title: 'Аналитика', desc: 'Подключите Яндекс.Метрику и Google Analytics для отслеживания трафика.' },
                  ].map((tip, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                        <i className={`fas ${tip.icon} text-amber-600 text-sm`}></i>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{tip.title}</p>
                        <p className="text-xs text-gray-500">{tip.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итоговая таблица действий */}
              <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl p-5 text-white">
                <p className="font-bold text-lg mb-3"><i className="fas fa-clipboard-check mr-2"></i>Чек-лист запуска сайта</p>
                <div className="space-y-2">
                  {[
                    '✅ Создан Telegram бот через @BotFather',
                    '✅ Куплен домен (reg.ru / namecheap / cloudflare)',
                    '✅ Выбран хостинг (GitHub Pages / Netlify / Beget)',
                    '✅ Сайт загружен на сервер (папка dist/)',
                    '✅ Домен привязан к хостингу (DNS-записи)',
                    '✅ SSL-сертификат активен (https://)',
                    '✅ Ссылка на бота настроена в админ-панели',
                    '✅ Товары и категории добавлены',
                    '✅ Мета-теги (title, description, keywords) прописаны',
                    '✅ Сайт добавлен в Яндекс.Вебмастер',
                    '✅ Сайт добавлен в Google Search Console',
                    '✅ Подключена Яндекс.Метрика / Google Analytics',
                    '✅ Проверена мобильная версия',
                    '✅ Проверена скорость загрузки (PageSpeed Insights)',
                  ].map((item, i) => (
                    <p key={i} className="text-sm text-white/90">{item}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h3 className="text-xl font-bold mb-4"><i className="fas fa-rocket mr-2"></i>Быстрый старт — 5 минут</h3>
            <div className="space-y-3">
              {[
                'Создайте бота через @BotFather в Telegram',
                'Скопируйте ссылку: https://t.me/ваш_bot',
                'Откройте сайт → нажмите «Админ» → пароль: admin123',
                'Вставьте ссылку на бота → Сохранить',
                'Добавьте категории и товары',
                'Готово! Клиенты видят каталог и жмут «Купить»'
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">{i + 1}</span>
                  <span className="text-white/90">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-5"><i className="fas fa-circle-question text-violet-600 mr-2"></i>Частые вопросы</h3>
            <div className="space-y-4">
              {[
                { q: 'Что увидит клиент в Telegram после нажатия «Купить»?', a: 'Клиент перейдёт в ваш бот. Бот получит сообщение с названием и ценой товара. Дальше бот обрабатывает заказ.' },
                { q: 'Сколько стоит запустить сайт?', a: 'Минимум: домен .ru (~199₽/год) + бесплатный хостинг (GitHub Pages / Netlify). Итого: от 17₽/мес!' },
                { q: 'Нужен ли программист?', a: 'Нет! Весь сайт настраивается через админ-панель. Загрузка на хостинг — перетаскивание папки.' },
                { q: 'Как продвигать сайт в поиске?', a: 'Соберите семантическое ядро, пропишите мета-теги, добавьте в Вебмастер, создавайте уникальный контент.' },
                { q: 'Как защитить от DDoS?', a: 'Подключите Cloudflare (бесплатный тариф). Он фильтрует вредоносный трафик и ускоряет загрузку.' },
              ].map((faq, i) => (
                <div key={i} className="border-b border-violet-50 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-900 mb-1"><i className="fas fa-question-circle text-violet-400 mr-2 text-sm"></i>{faq.q}</p>
                  <p className="text-sm text-gray-500 ml-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center pb-8">
            <button onClick={() => setShowInstruction(false)} className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300">
              <i className="fas fa-arrow-left mr-2"></i>Вернуться к каталогу
            </button>
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
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <i className="fas fa-store text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">ShopBot</h1>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full"><i className="fas fa-check-circle mr-1"></i>Админ</span>}
            <button onClick={() => { if (isAdmin) { setShowAdmin(!showAdmin) } else { setShowPasswordModal(true) } }} className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium">
              <i className="fas fa-cog mr-2"></i>{isAdmin ? 'Панель' : 'Админ'}
            </button>
          </div>
        </div>
      </header>

      {!showAdmin && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Наши <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">товары</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">Выберите товар и нажмите «Купить» — заказ оформляется через Telegram бот мгновенно</p>
          </div>
        </section>
      )}

      {/* Admin Panel */}
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

            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fab fa-telegram text-violet-600 mr-2"></i>Ссылка на Telegram бот</h3>
              <div className="flex gap-3 flex-wrap">
                <input type="text" value={botLink} onChange={(e) => { setBotLink(e.target.value); setSavedBotLink(false) }} placeholder="https://t.me/your_bot?start=buy" className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button onClick={() => { localStorage.setItem('shop_bot_link', botLink); setSavedBotLink(true); setTimeout(() => setSavedBotLink(false), 2000) }} className={`px-6 py-2 rounded-lg transition-all ${savedBotLink ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                  {savedBotLink ? <><i className="fas fa-check mr-1"></i>Сохранено!</> : 'Сохранить'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"><i className="fas fa-tags text-violet-600 mr-2"></i>Категории</h3>
              <div className="flex gap-3 mb-4 flex-wrap">
                <input type="text" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} placeholder="Название категории" className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <button onClick={handleAddCategory} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"><i className="fas fa-plus mr-1"></i>Добавить</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span key={cat.id} className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                    {cat.name}
                    {cat.id !== '1' && <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600"><i className="fas fa-times"></i></button>}
                  </span>
                ))}
              </div>
            </div>

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
                <input type="text" value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Описание (необязательно)" className="md:col-span-2 px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
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
          </div>
        </section>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Редактировать товар</h3>
            <div className="space-y-3">
              <input type="text" value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <select value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500">
                {categories.filter(c => c.name !== 'Все товары').map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <input type="text" value={editingProduct.image} onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
              <input type="text" value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleUpdateProduct} className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all">Сохранить</button>
              <button onClick={() => setEditingProduct(null)} className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all">Отмена</button>
            </div>
          </div>
        </div>
      )}

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

      {!showAdmin && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200' : 'bg-white text-gray-600 hover:bg-violet-50 border border-violet-100'}`}>
                  {cat.name}
                </button>
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
                    <button onClick={() => handleBuy(product)} className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 active:scale-95">
                      <i className="fab fa-telegram"></i>Купить
                    </button>
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
          <button onClick={() => setShowInstruction(true)} className="mt-3 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-all">
            <i className="fas fa-book-open"></i>Полная инструкция (домен, сервер, SEO)
          </button>
          <p className="text-xs text-gray-300 mt-2">© 2024 ShopBot</p>
        </div>
      </footer>
    </div>
  )
}

export default App
