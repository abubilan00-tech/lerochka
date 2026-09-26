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

// Default data
const defaultCategories: Category[] = [
  { id: '1', name: 'Все товары' },
  { id: '2', name: 'Электроника' },
  { id: '3', name: 'Одежда' },
  { id: '4', name: 'Аксессуары' },
]

const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Беспроводные наушники',
    price: 2990,
    category: 'Электроника',
    image: '',
    description: 'Качественные беспроводные наушники с шумоподавлением'
  },
  {
    id: '2',
    name: 'Смарт-часы',
    price: 4990,
    category: 'Электроника',
    image: '',
    description: 'Умные часы с фитнес-трекером'
  },
  {
    id: '3',
    name: 'Худи оверсайз',
    price: 3490,
    category: 'Одежда',
    image: '',
    description: 'Стильное худи свободного кроя'
  },
  {
    id: '4',
    name: 'Кожаный чехол',
    price: 1290,
    category: 'Аксессуары',
    image: '',
    description: 'Премиальный кожаный чехол для телефона'
  },
  {
    id: '5',
    name: 'Портативная колонка',
    price: 3990,
    category: 'Электроника',
    image: '',
    description: 'Мощная Bluetooth колонка'
  },
  {
    id: '6',
    name: 'Рюкзак городской',
    price: 2490,
    category: 'Аксессуары',
    image: '',
    description: 'Удобный городской рюкзак с USB портом'
  },
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

  // Admin form states
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', description: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [botLink, setBotLink] = useState(() => localStorage.getItem('shop_bot_link') || TELEGRAM_BOT_LINK)
  const [savedBotLink, setSavedBotLink] = useState(false)

  useEffect(() => {
    localStorage.setItem('shop_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('shop_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('shop_bot_link', botLink)
  }, [botLink])

  const handleBuy = (product: Product) => {
    const now = Date.now()
    const recentClicks = clickCounts.filter(t => now - t < CLICK_WINDOW)

    if (recentClicks.length >= MAX_CLICKS) {
      alert('Слишком много попыток! Подождите минуту и попробуйте снова.')
      return
    }

    setClickCounts([...recentClicks, now])

    const message = encodeURIComponent(`Купить: ${product.name} — ${product.price}₽`)
    const link = botLink.includes('?')
      ? `${botLink}&text=${message}`
      : `${botLink}?text=${message}`

    window.open(link, '_blank')
  }

  const handleAdminLogin = () => {
    const savedPassword = localStorage.getItem('shop_admin_password') || 'admin123'
    if (adminPassword === savedPassword) {
      setIsAdmin(true)
      setShowAdmin(true)
      setShowPasswordModal(false)
      setAdminPassword('')
    } else {
      alert('Неверный пароль!')
    }
  }

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      alert('Заполните обязательные поля: название, цена, категория')
      return
    }

    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: Number(newProduct.price),
      category: newProduct.category,
      image: newProduct.image,
      description: newProduct.description
    }

    setProducts([...products, product])
    setNewProduct({ name: '', price: '', category: '', image: '', description: '' })
  }

  const handleUpdateProduct = () => {
    if (!editingProduct) return
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p))
    setEditingProduct(null)
  }

  const handleDeleteProduct = (id: string) => {
    if (confirm('Удалить товар?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  const handleAddCategory = () => {
    if (!newCategory) return
    if (categories.find(c => c.name === newCategory)) {
      alert('Такая категория уже существует')
      return
    }
    setCategories([...categories, { id: Date.now().toString(), name: newCategory }])
    setNewCategory('')
  }

  const handleDeleteCategory = (id: string) => {
    if (id === '1') {
      alert('Нельзя удалить категорию "Все товары"')
      return
    }
    if (confirm('Удалить категорию?')) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  const filteredProducts = selectedCategory === 'Все товары'
    ? products
    : products.filter(p => p.category === selectedCategory)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Электроника': return 'fa-microchip'
      case 'Одежда': return 'fa-shirt'
      case 'Аксессуары': return 'fa-gem'
      default: return 'fa-box'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Электроника': return 'from-violet-500 to-purple-600'
      case 'Одежда': return 'from-purple-500 to-fuchsia-600'
      case 'Аксессуары': return 'from-indigo-500 to-violet-600'
      default: return 'from-violet-400 to-purple-500'
    }
  }

  // ===== INSTRUCTION PAGE =====
  if (showInstruction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
                <i className="fas fa-store text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
                ShopBot
              </h1>
            </div>
            <button
              onClick={() => setShowInstruction(false)}
              className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium"
            >
              <i className="fas fa-arrow-left mr-2"></i>Назад к каталогу
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
            <p className="text-gray-500 text-lg">Как настроить и использовать сайт с нуля</p>
          </div>

          {/* Table of Contents */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <i className="fas fa-list-ol text-violet-600 mr-2"></i>
              Содержание
            </h3>
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
              ].map(item => (
                <a
                  key={item.num}
                  href={`#step-${item.num}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-violet-50 transition-all group"
                >
                  <span className="w-8 h-8 bg-violet-100 group-hover:bg-violet-200 rounded-lg flex items-center justify-center text-violet-600 text-sm font-bold transition-all">
                    {item.num}
                  </span>
                  <span className="text-gray-700 group-hover:text-violet-700 text-sm font-medium transition-all">
                    <i className={`fas ${item.icon} mr-2 text-violet-400`}></i>
                    {item.title}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Step 1 */}
          <div id="step-1" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">1</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-robot text-violet-600 mr-2"></i>
                Создание Telegram бота
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Telegram бот — это ваш «продавец», через который клиенты будут оформлять заказы.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Пошаговая инструкция:</p>
                <ol className="space-y-3 ml-1">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Откройте Telegram и найдите бота <strong className="text-violet-700">@BotFather</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Нажмите <strong>«Start»</strong> / <strong>«Запустить»</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Отправьте команду <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">/newbot</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <span>Введите <strong>имя бота</strong> (например: <em>Мой Магазин</em>)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                    <span>Введите <strong>username бота</strong> (должен заканчиваться на <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">bot</code>, например: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">my_shop_bot</code>)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">6</span>
                    <span>BotFather пришлёт <strong>токен</strong> — сохраните его! Он выглядит так: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm break-all">1234567890:ABCdefGHIjklMNOpqrsTUVwxyz</code></span>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <i className="fas fa-lightbulb mr-2"></i>
                  <strong>Совет:</strong> Username бота должен быть уникальным. Если занят — попробуйте другой вариант.
                </p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div id="step-2" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">2</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-link text-violet-600 mr-2"></i>
                Получение ссылки на бота
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Ссылка на вашего бота формируется по шаблону:</p>

              <div className="bg-gray-900 rounded-xl p-5 font-mono text-center">
                <p className="text-green-400 text-lg">https://t.me/<span className="text-yellow-300">ваш_username</span></p>
              </div>

              <p>Например, если username бота <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">my_shop_bot</code>, то ссылка будет:</p>

              <div className="bg-gray-900 rounded-xl p-5 font-mono text-center">
                <p className="text-green-400 text-lg">https://t.me/my_shop_bot</p>
              </div>

              <p>Для более удобного перехода с параметром используйте:</p>

              <div className="bg-gray-900 rounded-xl p-5 font-mono text-center">
                <p className="text-green-400 text-lg">https://t.me/my_shop_bot?start=buy</p>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  Параметр <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">?start=buy</code> позволяет боту понять, что клиент пришёл с сайта для покупки.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div id="step-3" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">3</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-lock text-violet-600 mr-2"></i>
                Вход в админ-панель
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Админ-панель позволяет управлять товарами, категориями и настройками сайта.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Как войти:</p>
                <ol className="space-y-3 ml-1">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Нажмите кнопку <strong className="text-violet-700">«⚙ Админ»</strong> в правом верхнем углу сайта</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Введите пароль: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm">admin123</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Нажмите <strong>«Войти»</strong></span>
                  </li>
                </ol>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <strong>Важно:</strong> Пароль по умолчанию — <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-xs">admin123</code>. Смените его в коде сайта на свой!
                </p>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div id="step-4" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">4</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-cog text-violet-600 mr-2"></i>
                Настройка ссылки на Telegram бота
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>После входа в админ-панель первое, что нужно сделать — указать ссылку на вашего бота.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <ol className="space-y-3 ml-1">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Найдите блок <strong className="text-violet-700">«📨 Ссылка на Telegram бот»</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Вставьте вашу ссылку, например: <code className="bg-violet-100 px-2 py-0.5 rounded text-violet-700 font-mono text-sm break-all">https://t.me/my_shop_bot?start=buy</code></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Нажмите <strong>«Сохранить»</strong></span>
                  </li>
                </ol>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  Ссылка сохраняется в браузере и используется при каждом нажатии кнопки «Купить».
                </p>
              </div>
            </div>
          </div>

          {/* Step 5 */}
          <div id="step-5" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">5</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-tags text-violet-600 mr-2"></i>
                Добавление категорий
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Категории помогают организовать товары и упрощают поиск для покупателей.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <ol className="space-y-3 ml-1">
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                    <span>Найдите блок <strong className="text-violet-700">«🏷 Категории»</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                    <span>Введите название категории (например: <em>Обувь</em>, <em>Косметика</em>, <em>Игрушки</em>)</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                    <span>Нажмите <strong>«Добавить»</strong></span>
                  </li>
                  <li className="flex gap-3">
                    <span className="w-6 h-6 bg-violet-200 text-violet-700 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                    <span>Категория появится в списке ниже. Удалить можно нажав <strong className="text-red-500">✕</strong></span>
                  </li>
                </ol>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <i className="fas fa-info-circle mr-2"></i>
                  Категория <strong>«Все товары»</strong> — системная, её нельзя удалить. Она показывает все товары без фильтра.
                </p>
              </div>
            </div>
          </div>

          {/* Step 6 */}
          <div id="step-6" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">6</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-plus-circle text-violet-600 mr-2"></i>
                Добавление товаров
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Товары — это основной контент вашего магазина. Каждый товар отображается в виде карточки.</p>

              <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                <p className="font-semibold text-violet-800 mb-3"><i className="fas fa-list-check mr-2"></i>Заполните поля:</p>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <span className="text-violet-600 font-bold shrink-0">📦</span>
                    <div>
                      <strong>Название товара</strong> <span className="text-red-400">*</span>
                      <p className="text-sm text-gray-500">Короткое и понятное имя товара</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-violet-600 font-bold shrink-0">💰</span>
                    <div>
                      <strong>Цена (₽)</strong> <span className="text-red-400">*</span>
                      <p className="text-sm text-gray-500">Цена в рублях, только цифры</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-violet-600 font-bold shrink-0">🏷</span>
                    <div>
                      <strong>Категория</strong> <span className="text-red-400">*</span>
                      <p className="text-sm text-gray-500">Выберите из списка созданных категорий</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-violet-600 font-bold shrink-0">🖼</span>
                    <div>
                      <strong>URL фото</strong>
                      <p className="text-sm text-gray-500">Прямая ссылка на изображение товара (необязательно)</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <span className="text-violet-600 font-bold shrink-0">📝</span>
                    <div>
                      <strong>Описание</strong>
                      <p className="text-sm text-gray-500">Краткое описание товара (необязательно)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-amber-800 text-sm">
                  <i className="fas fa-image mr-2"></i>
                  <strong>Где взять фото?</strong> Загрузите изображение на любой хостинг (imgur.com, postimages.org) и скопируйте прямую ссылку.
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-green-800 text-sm">
                  <i className="fas fa-check-circle mr-2"></i>
                  Если фото не указано — автоматически покажется красивая иконка с градиентом по категории.
                </p>
              </div>
            </div>
          </div>

          {/* Step 7 */}
          <div id="step-7" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">7</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-edit text-violet-600 mr-2"></i>
                Редактирование и удаление товаров
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>В блоке <strong>«Все товары»</strong> внизу админ-панели виден список всех добавленных товаров.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-violet-50 rounded-xl p-5 border border-violet-100">
                  <p className="font-semibold text-violet-800 mb-2">
                    <i className="fas fa-pen mr-2"></i>Редактировать
                  </p>
                  <p className="text-sm text-gray-600">
                    Нажмите кнопку <span className="inline-flex items-center justify-center w-7 h-7 bg-violet-200 rounded-lg text-violet-700 text-xs"><i className="fas fa-edit"></i></span> рядом с товаром. Измените данные и нажмите «Сохранить».
                  </p>
                </div>
                <div className="bg-red-50 rounded-xl p-5 border border-red-100">
                  <p className="font-semibold text-red-800 mb-2">
                    <i className="fas fa-trash mr-2"></i>Удалить
                  </p>
                  <p className="text-sm text-gray-600">
                    Нажмите кнопку <span className="inline-flex items-center justify-center w-7 h-7 bg-red-200 rounded-lg text-red-700 text-xs"><i className="fas fa-trash"></i></span> рядом с товаром. Подтвердите удаление.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Step 8 */}
          <div id="step-8" className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-6 scroll-mt-24">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center text-white font-bold">8</span>
              <h3 className="text-xl font-bold text-gray-900">
                <i className="fas fa-shield-halved text-violet-600 mr-2"></i>
                Защита и безопасность
              </h3>
            </div>
            <div className="space-y-4 text-gray-600">
              <p>Сайт имеет встроенную защиту от злоупотреблений:</p>

              <div className="space-y-3">
                <div className="flex gap-4 items-start p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fas fa-clock text-green-700"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-green-800">Защита от накрутки кликов</p>
                    <p className="text-sm text-green-700">Максимум 10 нажатий «Купить» в минуту. При превышении — блокировка на 60 секунд.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fas fa-lock text-blue-700"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-blue-800">Пароль на админ-панель</p>
                    <p className="text-sm text-blue-700">Доступ к управлению товарами защищён паролем. По умолчанию: <code className="bg-blue-100 px-1.5 py-0.5 rounded font-mono text-xs">admin123</code></p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-violet-50 rounded-xl border border-violet-100">
                  <div className="w-10 h-10 bg-violet-200 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fas fa-database text-violet-700"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-violet-800">Локальное хранение данных</p>
                    <p className="text-sm text-violet-700">Все товары, категории и настройки сохраняются в localStorage браузера. Данные не теряются при перезагрузке страницы.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <div className="w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center shrink-0">
                    <i className="fas fa-server text-amber-700"></i>
                  </div>
                  <div>
                    <p className="font-semibold text-amber-800">Защита от DDoS</p>
                    <p className="text-sm text-amber-700">Для полноценной защиты от DDoS-атак рекомендуется подключить Cloudflare или аналогичный CDN-сервис к вашему домену.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Summary */}
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 md:p-8 text-white mb-8">
            <h3 className="text-xl font-bold mb-4">
              <i className="fas fa-rocket mr-2"></i>
              Быстрый старт — 5 минут
            </h3>
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
                  <span className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-white/90">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 md:p-8 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-5">
              <i className="fas fa-circle-question text-violet-600 mr-2"></i>
              Частые вопросы
            </h3>
            <div className="space-y-4">
              {[
                {
                  q: 'Что увидит клиент в Telegram после нажатия «Купить»?',
                  a: 'Клиент перейдёт в ваш Telegram бот. Бот получит сообщение с названием товара и ценой. Дальше бот обрабатывает заказ по вашему сценарию.'
                },
                {
                  q: 'Нужен ли мне бэкенд / сервер?',
                  a: 'Нет! Сайт полностью работает на фронтенде. Все данные хранятся в браузере (localStorage). Для продакшена можно подключить базу данных.'
                },
                {
                  q: 'Как сменить пароль администратора?',
                  a: 'В коде сайта найдите строку: localStorage.getItem("shop_admin_password") || "admin123" и замените "admin123" на свой пароль.'
                },
                {
                  q: 'Данные пропали после очистки браузера?',
                  a: 'Данные хранятся в localStorage. При очистке кэша браузера они удалятся. Для надёжности используйте серверное хранение.'
                },
                {
                  q: 'Как подключить защиту от DDoS?',
                  a: 'Зарегистрируйтесь на cloudflare.com, добавьте ваш сайт и включите защиту. Бесплатный тариф обеспечивает базовую DDoS-защиту.'
                }
              ].map((faq, i) => (
                <div key={i} className="border-b border-violet-50 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-gray-900 mb-1">
                    <i className="fas fa-question-circle text-violet-400 mr-2 text-sm"></i>
                    {faq.q}
                  </p>
                  <p className="text-sm text-gray-500 ml-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Back button */}
          <div className="text-center pb-8">
            <button
              onClick={() => setShowInstruction(false)}
              className="px-8 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300"
            >
              <i className="fas fa-arrow-left mr-2"></i>
              Вернуться к каталогу
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ===== MAIN CATALOG =====
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm border-b border-violet-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-purple-700 rounded-xl flex items-center justify-center">
              <i className="fas fa-store text-white text-lg"></i>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-violet-700 to-purple-600 bg-clip-text text-transparent">
              ShopBot
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <span className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                <i className="fas fa-check-circle mr-1"></i>Админ
              </span>
            )}
            <button
              onClick={() => {
                if (isAdmin) {
                  setShowAdmin(!showAdmin)
                } else {
                  setShowPasswordModal(true)
                }
              }}
              className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm font-medium"
            >
              <i className="fas fa-cog mr-2"></i>
              {isAdmin ? 'Панель' : 'Админ'}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      {!showAdmin && (
        <section className="py-12 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Наши <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">товары</span>
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              Выберите товар и нажмите «Купить» — заказ оформляется через Telegram бот мгновенно
            </p>
          </div>
        </section>
      )}

      {/* Admin Panel */}
      {showAdmin && isAdmin && (
        <section className="py-8 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-2xl font-bold text-gray-900">
                <i className="fas fa-shield-halved text-violet-600 mr-2"></i>
                Панель управления
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsAdmin(false)}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-all text-sm"
                >
                  <i className="fas fa-sign-out-alt mr-1"></i>Выйти
                </button>
                <button
                  onClick={() => setShowAdmin(false)}
                  className="px-4 py-2 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg transition-all text-sm"
                >
                  <i className="fas fa-arrow-left mr-1"></i>К каталогу
                </button>
              </div>
            </div>

            {/* Bot Link Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fab fa-telegram text-violet-600 mr-2"></i>
                Ссылка на Telegram бот
              </h3>
              <div className="flex gap-3 flex-wrap">
                <input
                  type="text"
                  value={botLink}
                  onChange={(e) => { setBotLink(e.target.value); setSavedBotLink(false) }}
                  placeholder="https://t.me/your_bot?start=buy"
                  className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => { localStorage.setItem('shop_bot_link', botLink); setSavedBotLink(true); setTimeout(() => setSavedBotLink(false), 2000) }}
                  className={`px-6 py-2 rounded-lg transition-all ${savedBotLink ? 'bg-green-500 text-white' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}
                >
                  {savedBotLink ? <><i className="fas fa-check mr-1"></i>Сохранено!</> : 'Сохранить'}
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                При нажатии «Купить» клиент перейдёт по этой ссылке в Telegram
              </p>
            </div>

            {/* Add Category */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-tags text-violet-600 mr-2"></i>
                Категории
              </h3>
              <div className="flex gap-3 mb-4 flex-wrap">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 min-w-[200px] px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={handleAddCategory}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
                >
                  <i className="fas fa-plus mr-1"></i>Добавить
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map(cat => (
                  <span key={cat.id} className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm">
                    {cat.name}
                    {cat.id !== '1' && (
                      <button onClick={() => handleDeleteCategory(cat.id)} className="text-red-400 hover:text-red-600">
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </span>
                ))}
              </div>
            </div>

            {/* Add Product */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-plus-circle text-violet-600 mr-2"></i>
                Добавить товар
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Название товара *"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  placeholder="Цена (₽) *"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  <option value="">Выберите категорию *</option>
                  {categories.filter(c => c.name !== 'Все товары').map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newProduct.image}
                  onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                  placeholder="URL фото (необязательно)"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Описание (необязательно)"
                  className="md:col-span-2 px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <button
                onClick={handleAddProduct}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all font-medium"
              >
                <i className="fas fa-plus mr-2"></i>Добавить товар
              </button>
            </div>

            {/* Products List */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-list text-violet-600 mr-2"></i>
                Все товары ({products.length})
              </h3>
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-14 h-14 rounded-lg object-cover" />
                    ) : (
                      <div className={`w-14 h-14 rounded-lg bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}>
                        <i className={`fas ${getCategoryIcon(product.category)} text-white`}></i>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category} • {product.price}₽</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="px-3 py-1 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-lg text-sm transition-all"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm transition-all"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
                {products.length === 0 && (
                  <p className="text-center text-gray-400 py-8">Товаров пока нет. Добавьте первый!</p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Редактировать товар</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={editingProduct.name}
                onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                placeholder="Название"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                placeholder="Цена"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {categories.filter(c => c.name !== 'Все товары').map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={editingProduct.image}
                onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                placeholder="URL фото"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                placeholder="Описание"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateProduct}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-2">
              <i className="fas fa-lock text-violet-600 mr-2"></i>
              Вход в админ-панель
            </h3>
            <p className="text-sm text-gray-500 mb-4">Введите пароль для доступа</p>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Пароль"
              className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleAdminLogin}
                className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
              >
                Войти
              </button>
              <button
                onClick={() => { setShowPasswordModal(false); setAdminPassword('') }}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all"
              >
                Отмена
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              Пароль по умолчанию: admin123
            </p>
          </div>
        </div>
      )}

      {/* Catalog */}
      {!showAdmin && (
        <section className="px-4 pb-16">
          <div className="max-w-7xl mx-auto">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.name
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-200'
                      : 'bg-white text-gray-600 hover:bg-violet-50 border border-violet-100'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl shadow-sm border border-violet-100 overflow-hidden hover:shadow-lg hover:shadow-violet-100 transition-all duration-300 group"
                >
                  <div className="h-48 relative overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getCategoryColor(product.category)} flex items-center justify-center`}>
                        <i className={`fas ${getCategoryIcon(product.category)} text-white text-4xl opacity-80`}></i>
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-violet-700">
                        {product.price.toLocaleString()}₽
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{product.category}</p>
                    {product.description && (
                      <p className="text-sm text-gray-400 mb-4 line-clamp-2">{product.description}</p>
                    )}

                    <button
                      onClick={() => handleBuy(product)}
                      className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-md shadow-violet-200 hover:shadow-lg hover:shadow-violet-300 active:scale-95"
                    >
                      <i className="fab fa-telegram"></i>
                      Купить
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

      {/* Footer */}
      <footer className="bg-white border-t border-violet-100 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-700 rounded-lg flex items-center justify-center">
              <i className="fas fa-store text-white text-sm"></i>
            </div>
            <span className="font-bold text-gray-900">ShopBot</span>
          </div>
          <p className="text-sm text-gray-400">
            Покупки через Telegram бот — быстро и удобно
          </p>
          <button
            onClick={() => setShowInstruction(true)}
            className="mt-3 inline-flex items-center gap-2 text-sm text-violet-600 hover:text-violet-800 transition-all"
          >
            <i className="fas fa-book-open"></i>
            Инструкция по настройке
          </button>
          <p className="text-xs text-gray-300 mt-2">
            © 2024 ShopBot. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
