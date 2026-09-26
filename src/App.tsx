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

// Telegram bot link - change this to your bot
const TELEGRAM_BOT_LINK = 'https://t.me/your_bot?start=buy'

// Rate limiting
const MAX_CLICKS = 10
const CLICK_WINDOW = 60000 // 1 minute

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
  
  // Admin form states
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', image: '', description: '' })
  const [newCategory, setNewCategory] = useState('')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [botLink, setBotLink] = useState(() => localStorage.getItem('shop_bot_link') || TELEGRAM_BOT_LINK)

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('shop_products', JSON.stringify(products))
  }, [products])

  useEffect(() => {
    localStorage.setItem('shop_categories', JSON.stringify(categories))
  }, [categories])

  useEffect(() => {
    localStorage.setItem('shop_bot_link', botLink)
  }, [botLink])

  // Rate limiting for buy button
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

  // Admin login
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

  // Add product
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

  // Update product
  const handleUpdateProduct = () => {
    if (!editingProduct) return
    
    setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p))
    setEditingProduct(null)
  }

  // Delete product
  const handleDeleteProduct = (id: string) => {
    if (confirm('Удалить товар?')) {
      setProducts(products.filter(p => p.id !== id))
    }
  }

  // Add category
  const handleAddCategory = () => {
    if (!newCategory) return
    if (categories.find(c => c.name === newCategory)) {
      alert('Такая категория уже существует')
      return
    }
    setCategories([...categories, { id: Date.now().toString(), name: newCategory }])
    setNewCategory('')
  }

  // Delete category
  const handleDeleteCategory = (id: string) => {
    if (id === '1') {
      alert('Нельзя удалить категорию "Все товары"')
      return
    }
    if (confirm('Удалить категорию?')) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  // Filter products
  const filteredProducts = selectedCategory === 'Все товары' 
    ? products 
    : products.filter(p => p.category === selectedCategory)

  // Product icons based on category
  const getCategoryIcon = (category: string) => {
    switch(category) {
      case 'Электроника': return 'fa-microchip'
      case 'Одежда': return 'fa-shirt'
      case 'Аксессуары': return 'fa-gem'
      default: return 'fa-box'
    }
  }

  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'Электроника': return 'from-violet-500 to-purple-600'
      case 'Одежда': return 'from-purple-500 to-fuchsia-600'
      case 'Аксессуары': return 'from-indigo-500 to-violet-600'
      default: return 'from-violet-400 to-purple-500'
    }
  }

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
            <div className="flex items-center justify-between mb-6">
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
              <div className="flex gap-3">
                <input
                  type="text"
                  value={botLink}
                  onChange={(e) => setBotLink(e.target.value)}
                  placeholder="https://t.me/your_bot?start=buy"
                  className="flex-1 px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  onClick={() => alert('Ссылка сохранена!')}
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
                >
                  Сохранить
                </button>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                При нажатии "Купить" клиент перейдёт по этой ссылке в Telegram
              </p>
            </div>

            {/* Add Category */}
            <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <i className="fas fa-tags text-violet-600 mr-2"></i>
                Категории
              </h3>
              <div className="flex gap-3 mb-4">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Название категории"
                  className="flex-1 px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                  placeholder="Название товара *"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  placeholder="Цена (₽) *"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
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
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                  placeholder="URL фото (необязательно)"
                  className="px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <input
                  type="text"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
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
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category} • {product.price}₽</p>
                    </div>
                    <div className="flex gap-2">
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
                onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                placeholder="Название"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="number"
                value={editingProduct.price}
                onChange={(e) => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                placeholder="Цена"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <select
                value={editingProduct.category}
                onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {categories.filter(c => c.name !== 'Все товары').map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <input
                type="text"
                value={editingProduct.image}
                onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})}
                placeholder="URL фото"
                className="w-full px-4 py-2 border border-violet-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
              <input
                type="text"
                value={editingProduct.description}
                onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
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
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === cat.name
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
                  {/* Product Image */}
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

                  {/* Product Info */}
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
          <p className="text-xs text-gray-300 mt-2">
            © 2024 ShopBot. Все права защищены.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
