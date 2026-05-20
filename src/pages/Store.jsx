import axios from "axios";
import React, { useEffect, useState, useMemo } from "react";
import { Link,useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import ShippingModal from './ShippingModal';
import Navbar from "../Components/NavBar";

const RED    = '#cc0000';
const NAV_BG = 'rgba(0,0,0,0.45)';
const FONT_H = "'Bebas Neue', sans-serif";
const FONT_B = "'Barlow', sans-serif";

const ALL_PRODUCTS = [
  { id:1,  name:'Home Kit 25/26',         cat:'Fanella',    sub:'Burra',         price:89.99,  oldPrice:null,   badge:'I RI',     player:null,        num:null, img:'/Store/HomeKit.png',             bg:'rgba(0,0,0,0.25)', sizes:['S','M','L','XL','XXL'] },
  { id:2,  name:'Away Kit 25/26',          cat:'Fanella',    sub:'Burra',         price:89.99,  oldPrice:null,   badge:'AWAY',     player:null,        num:null, img:'/Store/AwayKit.png',             bg:'rgba(0,0,0,0.4)',  sizes:['S','M','L','XL'] },
  { id:3,  name:'Third Kit 25/26',         cat:'Fanella',    sub:'Burra',         price:89.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/ThirdKit.png',            bg:'rgba(0,0,0,0.2)',  sizes:['S','M','L','XL','XXL'] },
  { id:4,  name:'Home Kit - Fëmijë',       cat:'Fanella',    sub:'Fëmijë',        price:64.99,  oldPrice:null,   badge:'I RI',     player:null,        num:null, img:'/Store/HomeKitKids.png',         bg:'rgba(0,0,0,0.25)', sizes:['3-4','5-6','7-8','9-10','11-12'] },
  { id:5,  name:'Home Kit - Gra',          cat:'Fanella',    sub:'Gra',           price:79.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/HomeKitWomen.png',        bg:'rgba(0,0,0,0.2)',  sizes:['XS','S','M','L','XL'] },
  { id:6,  name:'Rashford #10',            cat:'Fanella',    sub:'Personalizuar', price:99.99,  oldPrice:null,   badge:'CUSTOM',   player:'RASHFORD',  num:'10', img:'/Store/Rashford.png',            bg:'rgba(0,0,0,0.3)', sizes:['S','M','L','XL','XXL'] },
  { id:7,  name:'Fernandes #8',            cat:'Fanella',    sub:'Personalizuar', price:99.99,  oldPrice:null,   badge:'CUSTOM',   player:'FERNANDES', num:'8',  img:'/Store/Fernandes.png',           bg:'rgba(0,0,0,0.3)', sizes:['S','M','L','XL','XXL'] },
  { id:8,  name:'Mount #7',               cat:'Fanella',    sub:'Personalizuar', price:99.99,  oldPrice:null,   badge:'CUSTOM',   player:'MOUNT',     num:'7',  img:'/Store/Mount.png',               bg:'rgba(0,0,0,0.3)', sizes:['S','M','L','XL'] },
  { id:9,  name:'Xhaketa Trajnimit',       cat:'Trajnim',    sub:'Burra',         price:54.99,  oldPrice:79.00,  badge:'30% ULJE', player:null,        num:null, img:'/Store/TrainingJacket.png',      bg:'rgba(0,0,0,0.2)',  sizes:['S','M','L','XL','XXL'] },
  { id:10, name:'Pantallona Trajnimi',      cat:'Trajnim',    sub:'Burra',         price:44.99,  oldPrice:60.00,  badge:'25% ULJE', player:null,        num:null, img:'/Store/TrainingPants.png',       bg:'rgba(0,0,0,0.2)',  sizes:['S','M','L','XL'] },
  { id:11, name:'Komplet Trajnimi',         cat:'Trajnim',    sub:'Burra',         price:94.99,  oldPrice:130.00, badge:'KOMPLETE', player:null,        num:null, img:'/Store/TrainingSuit.png',        bg:'rgba(0,0,0,0.35)', sizes:['S','M','L','XL','XXL'] },
  { id:12, name:'Xhaketa Trajnimit - Gra', cat:'Trajnim',    sub:'Gra',           price:54.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/TrainingJacketWomen.png', bg:'rgba(0,0,0,0.2)',  sizes:['XS','S','M','L','XL'] },
  { id:13, name:'Kapela MU 2025',           cat:'Aksesore',   sub:'Aksesore',      price:29.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/hat.png',                 bg:'rgba(0,0,0,0.2)',  sizes:['ONE SIZE'] },
  { id:14, name:'Shalli MU',               cat:'Aksesore',   sub:'Aksesore',      price:24.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/scarf.png',               bg:'rgba(0,0,0,0.2)',  sizes:['ONE SIZE'] },
  { id:15, name:'Çorapet MU',              cat:'Aksesore',   sub:'Aksesore',      price:14.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/socks.png',               bg:'rgba(0,0,0,0.2)',  sizes:['S','M','L'] },
  { id:16, name:'Top Zyrtar MU',           cat:'Aksesore',   sub:'Aksesore',      price:34.99,  oldPrice:49.99,  badge:'30% ULJE', player:null,        num:null, img:'/Store/ball.png',                bg:'rgba(0,0,0,0.25)', sizes:['ONE SIZE'] },
  { id:17, name:'Mug MU',                  cat:'Memorabilia',sub:'Memorabilia',   price:19.99,  oldPrice:null,   badge:null,       player:null,        num:null, img:'/Store/mug.png',                 bg:'rgba(0,0,0,0.2)',  sizes:['ONE SIZE'] },
  { id:18, name:'Foto e Nënshkruar',        cat:'Memorabilia',sub:'Memorabilia',   price:149.99, oldPrice:null,   badge:'EKSKL.',   player:null,        num:null, img:'/Store/signedPhoto.jpg',         bg:'rgba(0,0,0,0.3)',  sizes:['ONE SIZE'] },
];

const CATEGORIES    = ['Të gjitha','Fanella','Trajnim','Aksesore','Memorabilia'];
const SUBCATEGORIES = { Fanella:['Burra','Gra','Fëmijë','Personalizuar'], Trajnim:['Burra','Gra'], Aksesore:['Aksesore'], Memorabilia:['Memorabilia'] };
const SORT_OPTIONS  = [
  {value:'default',    label:'Parazgjedhja'},
  {value:'price-asc',  label:'Çmimi: Ulët → Lartë'},
  {value:'price-desc', label:'Çmimi: Lartë → Ulët'},
  {value:'name-asc',   label:'Emri: A → Z'},
  {value:'sale',       label:'Në Shitje'},
];

if (!document.getElementById('mu-store-fonts')) {
  const l = document.createElement('link');
  l.id = 'mu-store-fonts';
  l.rel = 'stylesheet';
  l.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;600;700&display=swap';
  document.head.appendChild(l);
}

// ── CART SIDEBAR ──────────────────────────────────────────────────────────────
function CartSidebar({ cart, onClose, onRemove, onClear, onCheckout }) {
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);
  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.65)',zIndex:1000}} />
      <div className="position-fixed top-0 end-0 h-100 d-flex flex-column" style={{width:380,zIndex:1001,background:'#1a0000',borderLeft:`3px solid rgba(255,255,255,0.15)`}}>
        <div className="d-flex align-items-center justify-content-between px-4 py-3" style={{background:NAV_BG,borderBottom:'1px solid rgba(255,255,255,0.1)'}}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-cart3 text-white fs-5"></i>
            <span style={{fontFamily:FONT_H,fontSize:20,letterSpacing:2,color:'#fff'}}>SHPORTA IME</span>
            <span className="d-flex align-items-center justify-content-center rounded-circle" style={{background:'#fff',color:RED,width:22,height:22,fontSize:11,fontWeight:700}}>
              {cart.reduce((s,i)=>s+i.qty,0)}
            </span>
          </div>
          <button onClick={onClose} className="btn border-0 bg-transparent text-white"><i className="bi bi-x-lg"></i></button>
        </div>

        <div className="flex-fill overflow-auto px-4 py-2">
          {cart.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x" style={{fontSize:48,color:'rgba(255,255,255,0.3)'}}></i>
              <p className="mt-3" style={{fontFamily:FONT_H,fontSize:20,letterSpacing:2,color:'rgba(255,255,255,0.4)'}}>SHPORTA ËSHTË BOSH</p>
            </div>
          ) : cart.map(item => (
            <div key={item.cartId} className="d-flex align-items-center gap-3 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
              <div className="d-flex align-items-center justify-content-center rounded-2 flex-shrink-0" style={{width:60,height:60,background:'rgba(255,255,255,0.08)'}}>
               {item.img
  ? <img src={item.img} alt={item.name}
      style={{ width:48, height:48, objectFit:'contain' }} />
  : item.player
    ? <div className="text-center" style={{lineHeight:1}}>
        <div style={{fontSize:7,fontFamily:FONT_B,letterSpacing:1,color:'rgba(255,255,255,0.45)',textTransform:'uppercase'}}>{item.player}</div>
        <div style={{fontSize:18,fontFamily:FONT_H,color:'#fff',letterSpacing:0.5}}>#{item.num}</div>
      </div>
    : <span style={{fontSize:26}}>{item.icon}</span>}
              </div>
              <div className="flex-fill">
                <div style={{fontFamily:FONT_H,fontSize:15,color:'#fff',letterSpacing:0.5}}>{item.name}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontFamily:FONT_B}}>Madhësia: {item.selectedSize} · x{item.qty}</div>
                <div style={{fontFamily:FONT_H,fontSize:16,color:'#fff'}}>€{(item.price*item.qty).toFixed(2)}</div>
              </div>
              <button onClick={() => onRemove(item.cartId)} className="btn border-0 bg-transparent" style={{color:'rgba(255,255,255,0.35)'}}>
                <i className="bi bi-trash3"></i>
              </button>
            </div>
          ))}
        </div>

        {cart.length > 0 && (
          <div className="px-4 py-3" style={{borderTop:'1px solid rgba(255,255,255,0.08)',background:NAV_BG}}>
            <div className="d-flex justify-content-between mb-2">
              <span style={{color:'rgba(255,255,255,0.5)',fontSize:13,fontFamily:FONT_B}}>Nëntotali</span>
              <span style={{color:'#fff',fontWeight:700}}>€{total.toFixed(2)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span style={{color:'rgba(255,255,255,0.5)',fontSize:13,fontFamily:FONT_B}}>Dërgesa</span>
              <span style={{color:'#4ade80',fontSize:13,fontWeight:700}}>{total>=75?'FALAS':'€4.99'}</span>
            </div>
            {total < 75 && (
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>Dërgesa falas mbi €75</span>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>€{(75-total).toFixed(2)} mungon</span>
                </div>
                <div className="progress" style={{height:3,background:'rgba(255,255,255,0.1)'}}>
                  <div className="progress-bar" style={{width:`${Math.min((total/75)*100,100)}%`,background:'#fff'}}></div>
                </div>
              </div>
            )}
           <button onClick={onCheckout} className="btn w-100 fw-bold mb-2" style={{background:'#fff',color:RED,fontFamily:FONT_H,fontSize:16,letterSpacing:2,padding:13,border:'none',borderRadius:0}}>
  <i className="bi bi-lock me-2"></i>VAZHDO · €{(total+(total>=75?0:4.99)).toFixed(2)}
</button>
            <button onClick={onClear} className="btn w-100" style={{border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.5)',fontFamily:FONT_B,fontWeight:600,fontSize:12,borderRadius:0,background:'transparent'}}>
              Pastro shportën
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ── SIZE MODAL ────────────────────────────────────────────────────────────────
function SizeModal({ product, onConfirm, onClose }) {
  const [selected, setSelected] = useState(null);
  return (
    <>
      <div onClick={onClose} className="position-fixed top-0 start-0 w-100 h-100" style={{background:'rgba(0,0,0,0.7)',zIndex:1000}} />
      <div className="position-fixed p-4" style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)',zIndex:1002,width:360,background:'#1a0000',border:'1px solid rgba(255,255,255,0.12)'}}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div style={{fontFamily:FONT_H,fontSize:24,color:'#fff',letterSpacing:1}}>{product.name}</div>
            <div style={{color:'rgba(255,255,255,0.4)',fontSize:11,fontFamily:FONT_B,fontWeight:700,letterSpacing:2,textTransform:'uppercase'}}>ZGJIDHNI MADHËSINË</div>
          </div>
          <button onClick={onClose} className="btn border-0 bg-transparent text-white"><i className="bi bi-x-lg"></i></button>
        </div>
        <div className="d-flex flex-wrap gap-2 mb-4">
          {product.sizes.map(s => (
            <button key={s} onClick={() => setSelected(s)} className="btn"
              style={{
                minWidth:52,padding:'8px 10px',
                fontFamily:FONT_B,fontWeight:700,fontSize:13,letterSpacing:1,
                background: selected===s ? '#fff' : 'rgba(255,255,255,0.08)',
                color: selected===s ? RED : 'rgba(255,255,255,0.7)',
                border:`1.5px solid ${selected===s?'#fff':'rgba(255,255,255,0.15)'}`,
                borderRadius:0,
              }}
            >{s}</button>
          ))}
        </div>
        <button onClick={() => selected && onConfirm(selected)} disabled={!selected} className="btn w-100 fw-bold"
          style={{
            background: selected ? '#fff' : 'rgba(255,255,255,0.1)',
            color: selected ? RED : 'rgba(255,255,255,0.25)',
            fontFamily:FONT_H,fontSize:16,letterSpacing:2,padding:13,border:'none',borderRadius:0,
          }}>
          {selected ? `SHTO NË SHPORTË — €${product.price.toFixed(2)}` : 'ZGJIDHNI MADHËSINË'}
        </button>
      </div>
    </>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────────────────────
function ProductCard({   
  product,
  onAdd,
  onWishlist,
  wishlisted,
  role,
  navigate,
  handleDelete }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="col">
      <div
        className="h-100 overflow-hidden"
        style={{
          background:'rgba(0,0,0,0.25)',
          border:`1px solid ${hovered?'rgba(255,255,255,0.3)':'rgba(255,255,255,0.08)'}`,
          transform:hovered?'translateY(-4px)':'none',
          boxShadow:hovered?'0 16px 40px rgba(0,0,0,0.5)':'none',
          transition:'all 0.2s',cursor:'pointer',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="d-flex align-items-center justify-content-center position-relative"
          style={{height:200,background:product.bg,overflow:'hidden'}}>
  {product.img
  ? <img src={product.img} alt={product.name}
      style={{ width:'75%', height:'75%', objectFit:'contain' }} />
  : product.player
    ? <div className="text-center">
        <div style={{fontFamily:FONT_B,fontSize:11,fontWeight:700,letterSpacing:2,color:'rgba(255,255,255,0.45)',textTransform:'uppercase'}}>{product.player}</div>
        <div style={{fontFamily:FONT_H,fontSize:62,color:'#fff',lineHeight:1}}>#{product.num}</div>
      </div>
    : <span style={{fontSize:60}}>{product.icon}</span>}
          {product.badge && (
            <span className="position-absolute top-0 start-0 m-2"
              style={{background:'#fff',color:RED,fontSize:9,fontFamily:FONT_B,fontWeight:700,letterSpacing:1,padding:'3px 8px'}}>
              {product.badge}
            </span>
          )}
          <button onClick={() => onWishlist(product.id)}
            className="position-absolute top-0 end-0 m-2 d-flex align-items-center justify-content-center border-0"
            style={{width:30,height:30,background:'rgba(0,0,0,0.4)',color:wishlisted?'#fff':'rgba(255,255,255,0.35)',borderRadius:'50%',cursor:'pointer'}}>
            <i className={`bi ${wishlisted?'bi-heart-fill':'bi-heart'}`} style={{fontSize:13}}></i>
          </button>
          <button onClick={() => onAdd(product)}
            className="position-absolute bottom-0 start-0 end-0 mx-2 mb-2 fw-bold border-0"
            style={{
              background:'#fff',color:RED,fontFamily:FONT_B,fontWeight:700,fontSize:12,
              letterSpacing:1.5,padding:'9px 0',textTransform:'uppercase',cursor:'pointer',
              opacity:hovered?1:0,transform:hovered?'translateY(0)':'translateY(8px)',transition:'all 0.2s',
            }}>
            SHTO NË SHPORTË
          </button>
          
        </div>
        <div className="p-3">
          <div style={{fontSize:10,color:'rgba(255,255,255,0.38)',letterSpacing:1.5,fontFamily:FONT_B,fontWeight:600,textTransform:'uppercase',marginBottom:4}}>{product.cat} · {product.sub}</div>
          <div style={{fontFamily:FONT_H,fontSize:19,color:'#fff',letterSpacing:0.5,marginBottom:8}}>{product.name}</div>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {product.oldPrice && <span style={{fontSize:12,color:'rgba(255,255,255,0.3)',textDecoration:'line-through'}}>€{product.oldPrice.toFixed(2)}</span>}
            <span style={{fontFamily:FONT_H,fontSize:20,color:'#fff'}}>€{product.price.toFixed(2)}</span>
            {product.oldPrice && (
              <span style={{background:'#fff',color:RED,fontSize:9,fontFamily:FONT_B,fontWeight:700,letterSpacing:1,padding:'2px 6px'}}>
                -{Math.round(100-(product.price/product.oldPrice)*100)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── STORE PAGE ────────────────────────────────────────────────────────────────
export default function Store() {
  const role = localStorage.getItem("role");
  const [products, setProducts] = useState([]);
  const [activeCat, setActiveCat]       = useState('Të gjitha');
  const [activeSubs, setActiveSubs]     = useState([]);
  const [sortBy, setSortBy]             = useState('default');
  const [search, setSearch]             = useState('');
  const [maxPrice, setMaxPrice]         = useState(200);
  const [cart, setCart]                 = useState([]);
  const [cartOpen, setCartOpen]         = useState(false);
  const [wishlist, setWishlist]         = useState([]);
  const [sizeProduct, setSizeProduct]   = useState(null);
  const [toast, setToast]               = useState(null);
  const [shippingOpen, setShippingOpen] = useState(false);

  useEffect(() => {

  axios
    .get("http://localhost:5001/store")

    .then((res) => {

      const formatted = res.data.map((p) => ({

        ...p,

        cat: p.category,

        sub: p.subcategory,

        img: p.imageUrl,

        oldPrice: p.oldPrice,

        sizes: p.sizes.split(",")

      }));

      setProducts(formatted);

    })

    .catch((err) => console.log(err));

}, []);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(null),2500); };
  const handleAdd = p => setSizeProduct(p);
  const confirmAdd = size => {
    const item = {...sizeProduct, selectedSize:size, qty:1, cartId:Date.now()};
    setCart(prev => {
      const ex = prev.find(i => i.id===item.id && i.selectedSize===size);
      if (ex) return prev.map(i => i.cartId===ex.cartId ? {...i,qty:i.qty+1} : i);
      return [...prev, item];
    });
    setSizeProduct(null);
    showToast(`${item.name} (${size}) u shtua!`);
    setCartOpen(true);
  };
  const toggleWishlist = id => setWishlist(prev => prev.includes(id)?prev.filter(x=>x!==id):[...prev,id]);
  const toggleSub      = sub => setActiveSubs(prev => prev.includes(sub)?prev.filter(x=>x!==sub):[...prev,sub]);

  const navigate = useNavigate();

const handleCheckout = () => {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal >= 75 ? 0 : 4.99;
  navigate("/StoreConfirmation", {
    state: {
      order: {
        items: cart,
        subtotal,
        shipping,
        total: subtotal + shipping,
      },
    },
  });
  setCart([]);
  setCartOpen(false);
};
const handleDelete = async (id) => {

  try {

    await axios.delete(`http://localhost:5001/store/${id}`);

    setProducts(prev => prev.filter(p => p.id !== id));

    showToast("Produkti u fshi");

  } catch (err) {

    console.log(err);
  }
};

  const filtered = useMemo(() => {
    let list = products.length > 0 ? products : ALL_PRODUCTS;
    if (activeCat!=='Të gjitha') list = list.filter(p => p.cat===activeCat);
    if (activeSubs.length>0)    list = list.filter(p => activeSubs.includes(p.sub));
    if (search.trim())           list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    list = list.filter(p => p.price<=maxPrice);
    if (sortBy==='price-asc')  list = [...list].sort((a,b)=>a.price-b.price);
    if (sortBy==='price-desc') list = [...list].sort((a,b)=>b.price-a.price);
    if (sortBy==='name-asc')   list = [...list].sort((a,b)=>a.name.localeCompare(b.name));
    if (sortBy==='sale')       list = list.filter(p=>p.oldPrice);
    return list;
  }, [activeCat,activeSubs,search,maxPrice,sortBy]);

  const cartCount = cart.reduce((s,i)=>s+i.qty,0);

  return (
    <div style={{background:RED,minHeight:'100vh',fontFamily:FONT_B}}>

      <Navbar />

      {/* Store action bar */}
      <div className="d-flex align-items-center justify-content-end gap-2 px-4 py-2"
        style={{background:'rgba(0,0,0,0.3)',borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="d-flex align-items-center gap-2 px-3 py-1"
          style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)'}}>
          <i className="bi bi-search" style={{fontSize:13,color:'rgba(255,255,255,0.55)'}}></i>
          <input type="text" placeholder="Kërko..." value={search} onChange={e=>setSearch(e.target.value)}
            className="border-0 bg-transparent text-white"
            style={{outline:'none',fontSize:12,width:150,fontFamily:FONT_B}} />
        </div>
        <button onClick={()=>setShippingOpen(true)} className="btn border-0 bg-transparent text-white" style={{opacity:0.7}}>
          <i className="bi bi-globe2" style={{fontSize:16}}></i>
        </button>
        <button className="btn border-0 bg-transparent text-white position-relative" style={{opacity:0.7}}>
          <i className="bi bi-heart" style={{fontSize:16}}></i>
          {wishlist.length>0 && <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{background:'#fff',color:RED,fontSize:9}}>{wishlist.length}</span>}
        </button>
        <button onClick={()=>setCartOpen(true)} className="btn"
          style={{background:'transparent',color:'#fff',fontFamily:FONT_B,fontWeight:700,fontSize:12,letterSpacing:1,textTransform:'uppercase',border:'1.5px solid rgba(255,255,255,0.45)',borderRadius:0,padding:'6px 16px'}}>
          <i className="bi bi-cart3 me-1"></i>SHPORTA {cartCount>0&&`(${cartCount})`}
        </button>
      </div>

      {/* HERO HEADER */}
      <div style={{background:'rgba(0,0,0,0.18)',borderBottom:'1px solid rgba(255,255,255,0.08)',padding:'40px 40px 0'}}>
        <div className="mb-3">
          <span style={{background:'rgba(0,0,0,0.3)',color:'#fff',fontSize:10,fontWeight:700,letterSpacing:3,textTransform:'uppercase',padding:'4px 12px'}}>SEZONI 2025/26</span>
          <span style={{color:'rgba(255,255,255,0.55)',fontSize:12,fontWeight:600,letterSpacing:2,textTransform:'uppercase',marginLeft:12}}>OLD TRAFFORD</span>
        </div>
        <h1 style={{fontFamily:FONT_H,fontSize:'clamp(52px,7vw,86px)',color:'#fff',lineHeight:0.88,letterSpacing:1,marginBottom:20}}>
          DYQANI<br/><span style={{color:'rgba(255,255,255,0.22)'}}>ZYRTAR</span>
        </h1>

        {/* Category tabs */}
        <div className="d-flex" style={{overflowX:'auto',marginTop:16}}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={()=>{setActiveCat(c);setActiveSubs([]);}} className="btn border-0"
              style={{
                fontFamily:FONT_B,fontWeight:700,fontSize:13,letterSpacing:1,textTransform:'uppercase',
                color:activeCat===c?'#fff':'rgba(255,255,255,0.5)',
                borderBottom:activeCat===c?'3px solid #fff':'3px solid transparent',
                borderRadius:0,padding:'12px 20px',whiteSpace:'nowrap',background:'transparent',
              }}>{c}</button>
          ))}
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="px-4 py-2" style={{background:'rgba(0,0,0,0.2)',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <Link to="/" style={{color:'rgba(255,255,255,0.4)',fontSize:12,textDecoration:'none',fontWeight:600,letterSpacing:0.5}}>Kryefaqja</Link>
        <span style={{color:'rgba(255,255,255,0.25)',margin:'0 8px',fontSize:12}}>/</span>
        <span style={{color:'#fff',fontSize:12,fontWeight:700,letterSpacing:0.5}}>Dyqani</span>
        {activeCat!=='Të gjitha'&&<>
          <span style={{color:'rgba(255,255,255,0.25)',margin:'0 8px',fontSize:12}}>/</span>
          <span style={{color:'#fff',fontSize:12,fontWeight:700,letterSpacing:0.5}}>{activeCat}</span>
        </>}
      </div>

      {/* MAIN */}
      <div className="d-flex gap-4 px-4 py-4">

        {/* SIDEBAR */}
        <aside className="flex-shrink-0 p-3"
          style={{width:210,background:'rgba(0,0,0,0.25)',border:'1px solid rgba(255,255,255,0.08)',alignSelf:'flex-start',position:'sticky',top:16}}>

          {[
            {title:'RENDIT', content:(
              <select className="w-100 border-0" value={sortBy} onChange={e=>setSortBy(e.target.value)}
                style={{background:'rgba(255,255,255,0.08)',color:'#fff',fontFamily:FONT_B,fontSize:12,fontWeight:600,padding:'8px 10px',outline:'none',cursor:'pointer'}}>
                {SORT_OPTIONS.map(o=><option key={o.value} value={o.value} style={{background:'#1a0000'}}>{o.label}</option>)}
              </select>
            )},
            {title:'ÇMIMI MAX', content:(
              <>
                <input type="range" className="w-100" min="10" max="200" step="5"
                  value={maxPrice} onChange={e=>setMaxPrice(Number(e.target.value))} style={{accentColor:'#fff'}} />
                <div className="d-flex justify-content-between">
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>€10</span>
                  <span style={{fontSize:13,fontFamily:FONT_H,color:'#fff',letterSpacing:1}}>€{maxPrice}</span>
                </div>
              </>
            )},
          ].map(({title,content}) => (
            <div key={title} className="mb-4">
              <div style={{fontFamily:FONT_H,fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:8,marginBottom:10}}>{title}</div>
              {content}
            </div>
          ))}

          {activeCat!=='Të gjitha'&&SUBCATEGORIES[activeCat]&&(
            <div className="mb-4">
              <div style={{fontFamily:FONT_H,fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:8,marginBottom:10}}>NËNKATEGORIA</div>
              {SUBCATEGORIES[activeCat].map(sub=>(
                <label key={sub} className="d-flex align-items-center gap-2 mb-2" style={{cursor:'pointer'}}>
                  <input type="checkbox" className="form-check-input mt-0" checked={activeSubs.includes(sub)} onChange={()=>toggleSub(sub)} />
                  <span style={{color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:600}}>{sub}</span>
                </label>
              ))}
            </div>
          )}

          <div className="mb-4">
            <div style={{fontFamily:FONT_H,fontSize:13,color:'rgba(255,255,255,0.4)',letterSpacing:2,borderBottom:'1px solid rgba(255,255,255,0.08)',paddingBottom:8,marginBottom:10}}>FILTRO</div>
            <label className="d-flex align-items-center gap-2 mb-2" style={{cursor:'pointer'}}>
              <input type="checkbox" className="form-check-input mt-0" checked={sortBy==='sale'} onChange={()=>setSortBy(s=>s==='sale'?'default':'sale')} />
              <span style={{color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:600}}>Vetëm në shitje</span>
            </label>
            <label className="d-flex align-items-center gap-2 mb-2" style={{cursor:'pointer'}}>
              <input type="checkbox" className="form-check-input mt-0" checked={activeSubs.includes('Personalizuar')} onChange={()=>toggleSub('Personalizuar')} />
              <span style={{color:'rgba(255,255,255,0.65)',fontSize:13,fontWeight:600}}>Me emër lojtari</span>
            </label>
          </div>

          {(activeSubs.length>0||sortBy!=='default'||maxPrice<200||search)&&(
            <button className="btn w-100" style={{border:'1.5px solid rgba(255,255,255,0.25)',color:'rgba(255,255,255,0.6)',fontFamily:FONT_B,fontWeight:700,fontSize:12,letterSpacing:1,borderRadius:0,background:'transparent'}}
              onClick={()=>{setActiveSubs([]);setSortBy('default');setMaxPrice(200);setSearch('');}}>
              ✕ PASTRO FILTRAT
            </button>
          )}
        </aside>

        {/* PRODUCTS */}
        <main className="flex-fill">
          <div className="mb-3">
            <span style={{color:'rgba(255,255,255,0.45)',fontSize:12,fontWeight:700,letterSpacing:1.5,textTransform:'uppercase'}}>{filtered.length} PRODUKTE</span>
          </div>
          {filtered.length===0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search" style={{fontSize:48,color:'rgba(255,255,255,0.3)'}}></i>
              <p className="mt-3" style={{fontFamily:FONT_H,fontSize:22,letterSpacing:2,color:'rgba(255,255,255,0.4)'}}>ASNJË PRODUKT NUK U GJET</p>
              <button className="btn mt-2" style={{border:'1.5px solid rgba(255,255,255,0.3)',color:'#fff',fontFamily:FONT_B,fontWeight:700,fontSize:12,letterSpacing:1,borderRadius:0,background:'transparent'}}
                onClick={()=>{setActiveCat('Të gjitha');setSearch('');setActiveSubs([]);setMaxPrice(200);}}>
                PASTRO FILTRAT
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
              {filtered.map(p=>(
           <ProductCard
           key={p.id}
           product={p}
           onAdd={handleAdd}
           onWishlist={toggleWishlist}
           wishlisted={wishlist.includes(p.id)}
          />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* TICKER */}
      <div className="d-flex align-items-center overflow-hidden" style={{background:'rgba(0,0,0,0.42)',borderTop:'1px solid rgba(255,255,255,0.08)',padding:'10px 0',marginTop:24}}>
        <span className="flex-shrink-0 mx-3" style={{background:RED,color:'#fff',fontSize:10,fontWeight:700,letterSpacing:2,textTransform:'uppercase',padding:'4px 16px'}}>LIVE</span>
        <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontWeight:600,letterSpacing:0.5,whiteSpace:'nowrap',overflow:'hidden',display:'flex',gap:60}}>
          {['Man United 2–1 Arsenal · PL','Ndeshja: Chelsea · E Shtunë 20:00','Tabela: United 3. vend · 58 pikë','Transferim: Rashford kthehet në formë'].map((t,i)=>(
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* MODALS */}
      {shippingOpen&&<ShippingModal onClose={()=>setShippingOpen(false)} />}
      {cartOpen && <CartSidebar cart={cart} onClose={()=>setCartOpen(false)}
  onRemove={id=>setCart(prev=>prev.filter(i=>i.cartId!==id))}
  onClear={()=>setCart([])}
  onCheckout={handleCheckout} />}
      {sizeProduct&&<SizeModal product={sizeProduct} onConfirm={confirmAdd} onClose={()=>setSizeProduct(null)} />}

      {/* TOAST */}
      {toast&&(
        <div className="position-fixed d-flex align-items-center gap-3"
          style={{bottom:24,right:24,background:'#1a0000',border:'1px solid rgba(255,255,255,0.12)',borderLeft:'4px solid #fff',padding:'14px 18px',zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.5)'}}>
          <i className="bi bi-check-circle-fill" style={{color:'#4ade80',fontSize:18}}></i>
          <span style={{color:'#fff',fontSize:13,fontFamily:FONT_B,fontWeight:600}}>{toast}</span>
        </div>
      )}
    </div>
  );
}
