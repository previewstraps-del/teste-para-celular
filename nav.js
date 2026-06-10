import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
 
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
 
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
 
/* =====================================================
   FIREBASE
===================================================== */
 
const firebaseConfig = {
  apiKey: "AIzaSyAJTlL-4piG67VOM_y480dhyib2qaF3Bso",
  authDomain: "phenobrasil.firebaseapp.com",
  projectId: "phenobrasil",
  storageBucket: "phenobrasil.firebasestorage.app",
  messagingSenderId: "825755980394",
  appId: "1:825755980394:web:caad888821d128fb133013"
};
 
const app = getApps().length
  ? getApps()[0]
  : initializeApp(firebaseConfig);
 
export const auth = getAuth(app);
export const db   = getFirestore(app);
 
const googleProvider = new GoogleAuthProvider();
 
/* =====================================================
   HELPERS
===================================================== */
 
function safeElement(id) {
  return document.getElementById(id);
}
 
function updateCartBadges() {
  const total = JSON.parse(
    localStorage.getItem('pheno_cart') || '[]'
  ).reduce((sum, item) => sum + item.qty, 0);
 
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = total;
    badge.classList.toggle('visible', total > 0);
  });
}
 
function showToast(message) {
  const toast = safeElement('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}
 
/* =====================================================
   GLOBAL
===================================================== */
 
window.mostrarBreeders = (event) => {
  event.preventDefault();
  const path = window.location.pathname;
  if (
    path.endsWith("index.html") ||
    path === "/" ||
    path === "/index.html"
  ) {
    console.log("Abrindo modal de Breeders...");
    alert("Abrindo seletor de Breeders!");
  } else {
    location.href = 'breeders.html';
  }
};
 
/* =====================================================
   NAV
===================================================== */
 
// ── MENU MOBILE ──────────────────────────────────────────
window.toggleMobileMenu = () => {
  const btn  = document.getElementById('nav-hamburger');
  const menu = document.getElementById('nav-mobile-menu');
  if (!btn || !menu) return;
  btn.classList.toggle('open');
  menu.classList.toggle('open');
};
 
document.addEventListener('click', (e) => {
  const menu = document.getElementById('nav-mobile-menu');
  const btn  = document.getElementById('nav-hamburger');
  if (!menu || !btn) return;
  if (menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)) {
    menu.classList.remove('open');
    btn.classList.remove('open');
  }
});
 
export function renderNav(activeLink = '') {
 
  const links = [
    { label: 'Inicio', href: 'index.html' },
    { label: 'Breeders', href: 'breeders.html' },
    {
      label: 'Colecionaveis',
      href: 'sementes.html',
      dropdown: [
        {
          icon: '🌿',
          label: 'Breeders',
          sub: 'Conheça quem cultiva',
          href: 'breeders.html',
          onclick: 'window.mostrarBreeders(event)'
        },
        {
          icon: '🧬',
          label: 'Tipos de Sementes',
          sub: 'Fem, Auto, Regular...',
          href: '#'
        },
        {
          icon: '🔬',
          label: 'Canabinoides',
          sub: 'THC, CBD e mais',
          href: '#'
        }
      ]
    },
    { label: 'Sobre', href: 'sobre.html' },
    { label: 'Contato', href: 'contato.html' },
    { label: 'Loja', href: 'loja.html' },
    { label: 'Revista', href: 'Revista.html' },
    { label: 'cursos e mentorias', href: 'cursos.html' }
  ];
 
  const navItems = links.map(link => {
    const active = activeLink === link.label ? 'active' : '';
    const onclickAttr = link.onclick ? `onclick="${link.onclick}"` : '';
 
    if (link.dropdown) {
      const dropdownItems = link.dropdown.map(item => {
        const dropOnclick = item.onclick ? `onclick="${item.onclick}"` : '';
        return `
          <a href="${item.href}" ${dropOnclick}>
            ${item.icon} ${item.label}
            <span class="dropdown-sub">${item.sub}</span>
          </a>
        `;
      }).join('');
 
      return `
        <li>
          <a href="${link.href}" class="${active}">
            ${link.label}
            <span class="arrow">▼</span>
          </a>
          <div class="dropdown">
            ${dropdownItems}
          </div>
        </li>
      `;
    }
 
    return `
      <li>
        <a href="${link.href}" class="${active}" ${onclickAttr}>
          ${link.label}
        </a>
      </li>
    `;
  }).join('');
 
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <div class="topbar">
      <span>🌱 Sementes premium de coleção — Breeders brasileiros</span>
      <div id="auth-top-links"></div>
    </div>
 
    <nav>
      <div class="nav-logo" onclick="location.href='index.html'">
        <h2>
          PHENO<span style="color:var(--gold)">BRASIL</span>
        </h2>
      </div>
 
      <ul class="nav-center" id="nav-center">
        ${navItems}
      </ul>
 
      <div class="nav-right" id="auth-nav-btn"></div>
 
      <!-- HAMBÚRGUER -->
      <button class="nav-hamburger" id="nav-hamburger" onclick="toggleMobileMenu()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </nav>
 
    <!-- MENU MOBILE -->
    <div class="nav-mobile-menu" id="nav-mobile-menu">
      <ul class="nav-mobile-links" id="nav-mobile-links">
        ${navItems}
      </ul>
    </div>
 
    <!-- MODAL LOGIN/REGISTER COM GOOGLE -->
    <div class="modal-overlay" id="modal-overlay" onclick="closeModalOutside(event)">
      <div class="modal">
        <button class="modal-close" onclick="closeModal()">✕</button>
        
        <h2>Bem-vindo à <span>Pheno<span style="color:var(--gold)">Brasil</h2>
        <p class="modal-sub">Acesse sua conta ou crie uma nova</p>
 
        <div class="modal-tabs">
          <button class="modal-tab active" id="tab-login" onclick="switchTab('login')">Entrar</button>
          <button class="modal-tab" id="tab-register" onclick="switchTab('register')">Cadastrar</button>
        </div>
 
        <!-- LOGIN PANEL -->
        <div class="form-panel active" id="panel-login">
          <button class="btn-google" onclick="doGoogleLogin()">
            <img src="https://www.google.com/favicon.ico" alt="Google"> Entrar com Google
          </button>
          
          <div class="form-divider"><span>ou com email</span></div>
          
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="login-email" placeholder="seu@email.com">
          </div>
 
          <div class="form-group">
            <label>Senha</label>
            <input type="password" id="login-password" placeholder="••••••••">
          </div>
 
          <div class="form-error" id="login-error"></div>
          
          <button class="form-submit" id="login-btn" onclick="doLogin()">Entrar</button>
          
          <div class="form-divider" style="margin-top:1rem;">
            <span>Não tem conta? <a class="switch-link" onclick="switchTab('register')">Cadastre-se</a></span>
          </div>
        </div>
 
        <!-- REGISTER PANEL -->
        <div class="form-panel" id="panel-register">
          <button class="btn-google" onclick="doGoogleLogin()">
            <img src="https://www.google.com/favicon.ico" alt="Google"> Cadastrar com Google
          </button>
          
          <div class="form-divider"><span>ou com email</span></div>
          
          <div class="form-group">
            <label>Nome completo</label>
            <input type="text" id="reg-name" placeholder="Seu nome">
          </div>
 
          <div class="form-group">
            <label>Email</label>
            <input type="email" id="reg-email" placeholder="seu@email.com">
          </div>
 
          <div class="form-group">
            <label>Telefone / WhatsApp</label>
            <input type="tel" id="reg-phone" placeholder="(51) 99999-9999">
          </div>
 
          <div class="form-group">
            <label>Senha</label>
            <input type="password" id="reg-password" placeholder="Mínimo 6 caracteres">
          </div>
 
          <div class="form-group">
            <label>Confirmar Senha</label>
            <input type="password" id="reg-confirm" placeholder="Repita a senha">
          </div>
 
          <div class="form-error" id="reg-error"></div>
          
          <button class="form-submit" id="reg-btn" onclick="doRegister()">Criar conta</button>
          
          <div class="form-divider" style="margin-top:1rem;">
            <span>Já tem conta? <a class="switch-link" onclick="switchTab('login')">Entrar</a></span>
          </div>
        </div>
      </div>
    </div>
 
    <!-- CARRINHO -->
    <div class="cart-backdrop" id="cart-backdrop" onclick="fecharCarrinho()"></div>
 
    <div class="cart-drawer" id="cart-drawer">
      <div class="cart-header">
        <h3>🛒 Seu Carrinho</h3>
        <button class="cart-close-btn" onclick="fecharCarrinho()">✕</button>
      </div>
 
      <div class="cart-items" id="cart-items"></div>
 
      <div class="cart-footer" id="cart-footer" style="display:none">
        <div class="cart-total-row">
          <span class="cart-total-label">Total</span>
          <span class="cart-total-value" id="cart-total">R$ 0,00</span>
        </div>
 
        <button class="checkout-btn" onclick="finalizarPedido()">
          Finalizar Pedido
        </button>
 
        <button class="clear-cart-btn" onclick="limparCarrinho()">
          Esvaziar carrinho
        </button>
      </div>
    </div>
 
    <div class="toast" id="toast"></div>
    `
  );
}
 
/* =====================================================
   MODAL FUNCTIONS
===================================================== */
 
function openModal(tab) {
  document.getElementById('modal-overlay').classList.add('open');
  switchTab(tab || 'login');
  document.body.style.overflow = 'hidden';
}
 
function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
  document.body.style.overflow = '';
}
 
function closeModalOutside(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
}
 
function switchTab(tab) {
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.form-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + tab).classList.add('active');
  document.getElementById('panel-' + tab).classList.add('active');
  document.getElementById('login-error').textContent = '';
  document.getElementById('reg-error').textContent = '';
}
 
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
 
/* =====================================================
   AUTHENTICATION FUNCTIONS
===================================================== */
 
async function doGoogleLogin() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const userRef = doc(db, 'usuarios', user.uid);
    const snap = await getDoc(userRef);
 
    if (!snap.exists()) {
      await setDoc(userRef, {
        nome: user.displayName || '',
        email: user.email,
        telefone: '',
        foto: user.photoURL || '',
        criadoEm: serverTimestamp(),
        metodo: 'google'
      });
    }
 
    closeModal();
    showToast('✓ Bem-vindo(a), ' + (user.displayName || user.email) + '!');
  } catch(e) {
    if (e.code !== 'auth/popup-closed-by-user') {
      showToast('Erro ao entrar com Google. Tente novamente.');
    }
  }
}
 
async function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');
 
  if (!email || !password) {
    errEl.textContent = 'Preencha todos os campos.';
    return;
  }
 
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Entrando...';
 
  try {
    await signInWithEmailAndPassword(auth, email, password);
    closeModal();
    showToast('✓ Login realizado com sucesso!');
  } catch(e) {
    const msgs = {
      'auth/user-not-found': 'Email não encontrado.',
      'auth/wrong-password': 'Senha incorreta.',
      'auth/invalid-credential': 'Email ou senha incorretos.',
      'auth/too-many-requests': 'Muitas tentativas. Tente mais tarde.'
    };
    errEl.textContent = msgs[e.code] || 'Erro ao entrar.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Entrar';
  }
}
 
async function doRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirm = document.getElementById('reg-confirm').value;
  const errEl = document.getElementById('reg-error');
  const btn = document.getElementById('reg-btn');
 
  if (!name || !email || !phone || !password || !confirm) {
    errEl.textContent = 'Preencha todos os campos.';
    return;
  }
 
  if (password !== confirm) {
    errEl.textContent = 'As senhas não coincidem.';
    return;
  }
 
  if (password.length < 6) {
    errEl.textContent = 'Senha deve ter pelo menos 6 caracteres.';
    return;
  }
 
  errEl.textContent = '';
  btn.disabled = true;
  btn.textContent = 'Criando conta...';
 
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    
    await setDoc(doc(db, 'usuarios', cred.user.uid), {
      nome: name,
      email: email,
      telefone: phone,
      criadoEm: serverTimestamp(),
      metodo: 'email'
    });
 
    closeModal();
    showToast('✓ Conta criada! Bem-vindo(a), ' + name + '!');
  } catch(e) {
    const msgs = {
      'auth/email-already-in-use': 'Este email já está cadastrado.',
      'auth/invalid-email': 'Email inválido.',
      'auth/weak-password': 'Senha muito fraca.'
    };
    errEl.textContent = msgs[e.code] || 'Erro ao cadastrar.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Criar conta';
  }
}
 
async function fazerLogout() {
  try {
    await signOut(auth);
    location.reload();
  } catch (_) {}
}
 
// Expor funções globalmente
window.openModal = openModal;
window.closeModal = closeModal;
window.closeModalOutside = closeModalOutside;
window.switchTab = switchTab;
window.doGoogleLogin = doGoogleLogin;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.fazerLogout = fazerLogout;
 
/* =====================================================
   CART
===================================================== */
 
export function initCarrinho() {
 
  let carrinho = JSON.parse(
    localStorage.getItem('pheno_cart') || '[]'
  );
 
  const salvar = () => {
    localStorage.setItem('pheno_cart', JSON.stringify(carrinho));
  };
 
  const render = () => {
 
    const container = safeElement('cart-items');
    const footer = safeElement('cart-footer');
 
    if (!container || !footer) return;
 
    if (!carrinho.length) {
 
      container.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <p>
            Carrinho vazio.<br>
            Adicione produtos para começar seu pedido!
          </p>
        </div>
      `;
 
      footer.style.display = 'none';
      return;
 
    }
 
    let total = 0;
    container.innerHTML = '';
 
    carrinho.forEach((item, idx) => {
 
      total += item.price * item.qty;
 
      const div = document.createElement('div');
      div.className = 'cart-item';
 
      div.innerHTML = `
        <img class="cart-item-img" src="${item.image || ''}" alt="${item.name}">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-sub">${item.type}</div>
          <div class="cart-item-price">
            R$ ${(item.price * item.qty).toFixed(2).replace('.', ',')}
          </div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-controls">
            <button class="qty-btn" onclick="mudarQty(${idx},-1)">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" onclick="mudarQty(${idx},1)">+</button>
          </div>
          <button class="remove-btn" onclick="removerItem(${idx})">remover</button>
        </div>
      `;
 
      container.appendChild(div);
 
    });
 
    const totalElement = safeElement('cart-total');
    if (totalElement) {
      totalElement.textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    }
 
    footer.style.display = 'block';
    updateCartBadges();
 
  };
 
  window.abrirCarrinho = () => {
    render();
    const drawer = safeElement('cart-drawer');
    const backdrop = safeElement('cart-backdrop');
    if (drawer) drawer.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
  };
 
  window.fecharCarrinho = () => {
    const drawer = safeElement('cart-drawer');
    const backdrop = safeElement('cart-backdrop');
    if (drawer) drawer.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
  };
 
  window.mudarQty = (idx, delta) => {
    carrinho[idx].qty += delta;
    if (carrinho[idx].qty <= 0) {
      carrinho.splice(idx, 1);
    }
    salvar();
    render();
    updateCartBadges();
  };
 
  window.removerItem = (idx) => {
    const nome = carrinho[idx].name;
    carrinho.splice(idx, 1);
    salvar();
    render();
    updateCartBadges();
    showToast(`${nome} removido`);
  };
 
  window.limparCarrinho = () => {
    carrinho = [];
    salvar();
    render();
    updateCartBadges();
  };
 
  window.finalizarPedido = async () => {
    if (!carrinho.length) return;
 
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");
    const user = getAuth().currentUser;
    if (!user) {
      alert('Faça login para finalizar o pedido!');
      window.fecharCarrinho();
      document.getElementById('modal-overlay').style.display = 'flex';
      return;
    }
 
    const btnFinalizar = document.querySelector('.checkout-btn');
    if (btnFinalizar) { btnFinalizar.disabled = true; btnFinalizar.textContent = 'Verificando...'; }
 
    try {
      const { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
      const db = getFirestore();
 
      // ── VALIDAÇÃO DE ESTOQUE ──────────────────────────────
      const problemas = [];
      for (const item of carrinho) {
        // Tenta primeiro em 'products', depois em 'loja_produtos'
        let snap = await getDoc(doc(db, 'products', item.id));
        if (!snap.exists()) snap = await getDoc(doc(db, 'loja_produtos', item.id));
 
        if (!snap.exists()) {
          problemas.push(`"${item.name}" não existe mais.`);
          continue;
        }
 
        const d = snap.data();
        if (d.status === 'inativo') {
          problemas.push(`"${item.name}" está indisponível.`);
        } else if (d.status === 'esgotado' || d.estoque === 0) {
          problemas.push(`"${item.name}" está esgotado.`);
        } else if (d.estoque !== undefined && d.estoque < item.qty) {
          problemas.push(`"${item.name}" tem apenas ${d.estoque} unidade(s) disponível(is).`);
        }
      }
 
      if (problemas.length) {
        alert('⚠️ Não foi possível finalizar o pedido:\n\n' + problemas.join('\n') + '\n\nAtualize seu carrinho e tente novamente.');
        if (btnFinalizar) { btnFinalizar.disabled = false; btnFinalizar.textContent = 'Finalizar Pedido'; }
        return;
      }
      // ─────────────────────────────────────────────────────
 
      const total = carrinho.reduce((s, i) => s + (i.price * i.qty), 0);
 
      await addDoc(collection(db, 'pedidos'), {
        userId:    user.uid,
        userEmail: user.email,
        itens:     carrinho.map(i => ({
          id:    i.id,
          name:  i.name,
          type:  i.type,
          price: i.price,
          qty:   i.qty,
          image: i.image || ''
        })),
        total,
        status:   'pendente',
        criadoEm: serverTimestamp()
      });
 
      carrinho = [];
      salvarCarrinho();
      updateCartBadges();
      renderCarrinho();
      window.fecharCarrinho();
 
      const toast = document.getElementById('toast');
      if (toast) {
        toast.textContent = '✅ Pedido realizado! Acompanhe em Meu Perfil.';
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
      }
 
    } catch (err) {
      console.error(err);
      alert('Erro ao finalizar pedido: ' + err.message);
    } finally {
      if (btnFinalizar) { btnFinalizar.disabled = false; btnFinalizar.textContent = 'Finalizar Pedido'; }
    }
  };
 
  window.adicionarAoCarrinho = (
    id,
    name,
    type,
    price,
    image
  ) => {
 
    const existing = carrinho.findIndex(
      item => item.id === id
    );
 
    if (existing > -1) {
      carrinho[existing].qty++;
      showToast(`+1  ${name} adicionado!✅`);
    } else {
      carrinho.push({
        id,
        name,
        type,
        price,
        image,
        qty: 1
      });
      showToast(`✅ ${name} adicionado!`);
    }
 
    salvar();
    updateCartBadges();
 
    const button = document.querySelector(
      `[data-product-id="${id}"]`
    );
 
    if (button) {
      button.textContent = '✓ Adicionado';
      button.classList.add('added');
      setTimeout(() => {
        button.textContent = '+ Carrinho';
        button.classList.remove('added');
      }, 1500);
    }
 
  };
 
  updateCartBadges();
 
}
 
/* =====================================================
   AUTH STATE & UI
===================================================== */
 
export function initAuth() {
 
  const buildLogged = (user, role) => {
    const name = (user.displayName || user.email.split('@')[0]).split(' ')[0];
    const photo = user.photoURL || '';
    
    let html = '';
    
    if (role === 'admin') {
      html = `
        <button class="nav-btn primary" onclick="location.href='admin.html'">Painel Admin</button>
        <button class="nav-btn" onclick="fazerLogout()">Sair</button>
      `;
    } else if (role === 'breeder') {
      html = `
        <button class="nav-btn primary" onclick="location.href='breeder-dashboard.html'">Painel Breeder</button>
        <button class="nav-btn" onclick="fazerLogout()">Sair</button>
      `;
    } else if (role === 'vendedor') {
      html = `
        <button class="nav-btn primary" style="background:var(--gold);border-color:var(--gold);color:#000" onclick="location.href='produtos-dashboard.html'">Painel Loja</button>
        <button class="nav-btn" onclick="fazerLogout()">Sair</button>
      `;
    } else {
      html = `
        <div id="user-display" style="display:flex;align-items:center;gap:0.5rem;color:var(--gold);">
          ${photo ? `<img src="${photo}" alt="" style="width:28px;height:28px;border-radius:50%;object-fit:cover;">` : '👤'} ${name}
        </div>
        <button class="nav-btn primary" onclick="location.href='meu perfil.html'">Meu Perfil</button>
        <button class="nav-btn" onclick="fazerLogout()">Sair</button>
      `;
    }
 
    return `
      ${html}
      <button class="cart-nav-btn" onclick="abrirCarrinho()">
        🛒
        <span class="cart-badge"></span>
      </button>
    `;
  };
 
  const buildGuest = () => `
    <button class="nav-btn" onclick="openModal('login')">Entrar</button>
    <button class="nav-btn primary" onclick="openModal('register')">Cadastrar</button>
    <button class="cart-nav-btn" onclick="abrirCarrinho()">
      🛒
      <span class="cart-badge"></span>
    </button>
  `;
 
  onAuthStateChanged(auth, async (user) => {
 
    const topLinks = safeElement('auth-top-links');
    const navBtn = safeElement('auth-nav-btn');
 
    if (user) {
 
      let role = null;
 
      // Buscar em "usuarios" (usuários comuns)
      try {
        const snapUsuario = await getDoc(doc(db, 'usuarios', user.uid));
        if (snapUsuario.exists()) {
          role = snapUsuario.data()?.role || 'usuario';
        }
      } catch (_) {}
 
      // Se não achou, buscar em "users" (breeder, vendedor, admin)
      if (!role) {
        try {
          const snapUsers = await getDoc(doc(db, 'users', user.uid));
          if (snapUsers.exists()) {
            role = snapUsers.data()?.role || null;
          }
        } catch (_) {}
      }
 
      // Fallback
      if (!role) {
        role = user.email === 'admin@phenobrasil.com' ? 'admin' : 'usuario';
      }
 
      if (topLinks) {
        topLinks.innerHTML = `
          <span style="color:var(--gold)">
            Conectado: ${user.email}
          </span>
        `;
      }
 
      if (navBtn) {
        navBtn.innerHTML = buildLogged(user, role);
      }
 
    } else {
 
      if (topLinks) {
        topLinks.innerHTML = `
          <a onclick="openModal('login')" style="cursor:pointer;">
            Entrar / Login
          </a>
        `;
      }
 
      if (navBtn) {
        navBtn.innerHTML = buildGuest();
      }
 
    }
 
    updateCartBadges();
 
  });
 
}
 
