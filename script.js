// ====================================================================================================
// 1. إدارة حالة التطبيق (AppState)
// ====================================================================================================

/**
 * الكائن الرئيسي لحالة التطبيق.
 * يحتوي على البيانات (groups, members, funds, deposits) والحالة الحالية (currentPage).
 */
const AppState = {
    data: {
        groups: [
            { id: 1, name: 'مجموعة الأصدقاء', description: 'مجموعة لدعم المشاريع الصغيرة', members: [1, 2, 3] },
            { id: 2, name: 'عائلة آل فلان', description: 'صندوق العائلة الشهري', members: [4, 5] },
        ],
        members: [
            { id: 1, name: 'أحمد علي', phone: '0501234567', email: 'ahmad@example.com', groupIds: [1] },
            { id: 2, name: 'فاطمة محمد', phone: '0559876543', email: 'fatima@example.com', groupIds: [1] },
            { id: 3, name: 'خالد سعيد', phone: '0561122334', email: 'khalid@example.com', groupIds: [1] },
            { id: 4, name: 'سارة ناصر', phone: '0534455667', email: 'sara@example.com', groupIds: [2] },
            { id: 5, name: 'يوسف إبراهيم', phone: '0597788990', email: 'yousef@example.com', groupIds: [2] },
        ],
        funds: [
            { id: 1, name: 'صندوق الاستثمار الأول', goal: 50000, balance: 15000, startDate: '2024-01-01', endDate: '2025-01-01', status: 'مستمر' },
            { id: 2, name: 'صندوق الطوارئ', goal: 10000, balance: 8000, startDate: '2024-05-01', endDate: '2024-12-31', status: 'مستمر' },
        ],
        deposits: [
            { id: 1, memberId: 1, fundId: 1, amount: 500, date: '2024-06-01', status: 'مكتمل', notes: 'دفعة شهر يونيو' },
            { id: 2, memberId: 2, fundId: 1, amount: 500, date: '2024-06-01', status: 'مكتمل', notes: 'دفعة شهر يونيو' },
            { id: 3, memberId: 3, fundId: 1, amount: 500, date: '2024-06-01', status: 'مكتمل', notes: 'دفعة شهر يونيو' },
            { id: 4, memberId: 4, fundId: 2, amount: 200, date: '2024-07-15', status: 'لم يدفع', notes: 'دفعة شهر يوليو' },
            { id: 5, memberId: 5, fundId: 2, amount: 200, date: '2024-07-15', status: 'متأخر', notes: 'دفعة شهر يوليو' },
        ],
    },
    currentPage: 'dashboard',
    lastId: {
        member: 5,
        group: 2,
        fund: 2,
        deposit: 5,
    },
    filters: {
        deposits: {
            groupId: 'all',
            fundId: 'all',
            memberId: 'all',
            status: 'all',
        }
    }
};

// ====================================================================================================
// 2. الأدوات المساعدة العامة (Utilities)
// ====================================================================================================

/**
 * حفظ حالة التطبيق في التخزين المحلي للمتصفح.
 */
function saveAppState() {
    localStorage.setItem('sandouqAppState', JSON.stringify(AppState));
}

/**
 * تحميل حالة التطبيق من التخزين المحلي.
 */
function loadAppState() {
    const savedState = localStorage.getItem('sandouqAppState');
    if (savedState) {
        const loadedState = JSON.parse(savedState);
        // دمج الحالة المحفوظة مع الحالة الافتراضية لضمان وجود جميع الخصائص
        AppState.data = loadedState.data || AppState.data;
        AppState.currentPage = loadedState.currentPage || AppState.currentPage;
        AppState.lastId = loadedState.lastId || AppState.lastId;
        AppState.filters = loadedState.filters || AppState.filters;
    }
}

/**
 * توليد معرف فريد جديد لنوع معين من البيانات.
 * @param {string} type - نوع المعرف (member, group, fund, deposit).
 * @returns {number} المعرف الجديد.
 */
function getNextId(type) {
    AppState.lastId[type] = (AppState.lastId[type] || 0) + 1;
    saveAppState();
    return AppState.lastId[type];
}

/**
 * عرض إشعار (Toast) للمستخدم.
 * @param {string} message - نص الرسالة.
 * @param {string} type - نوع الرسالة ('success', 'danger', 'warning').
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="toast-title">${type === 'success' ? 'نجاح' : type === 'danger' ? 'خطأ' : 'تنبيه'}</div>
        <p class="toast-message">${message}</p>
    `;

    container.appendChild(toast);

    // إظهار الإشعار
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 10);

    // إخفاء الإشعار بعد 3 ثوانٍ
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-100%)';
        // إزالة الإشعار من DOM بعد انتهاء الانتقال
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ====================================================================================================
// 3. إدارة التنقل بين الصفحات (Navigation)
// ====================================================================================================

/**
 * دالة التنقل الرئيسية.
 * @param {string} page - اسم الصفحة المراد الانتقال إليها.
 */
function navigateTo(page) {
    AppState.currentPage = page;
    renderApp();
    saveAppState();
}

/**
 * عرض محتوى الصفحة الحالية في حاوية التطبيق الرئيسية.
 */
function renderApp() {
    const root = document.getElementById('app-root');
    if (!root) return;

    // تحديث شريط التنقل الجانبي
    const navItems = document.querySelectorAll('.sidebar-nav-item a');
    navItems.forEach(item => {
        const page = item.getAttribute('onclick').match(/'([^']+)'/)[1];
        if (page === AppState.currentPage) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // عرض محتوى الصفحة
    root.innerHTML = renderLayout(AppState.currentPage);
    renderPage(AppState.currentPage);
}

/**
 * إنشاء هيكل التخطيط العام للتطبيق (شريط التنقل + المحتوى الرئيسي).
 * @param {string} currentPage - اسم الصفحة الحالية.
 * @returns {string} كود HTML للتخطيط.
 */
function renderLayout(currentPage) {
    return `
        <div class="sidebar">
            <div class="sidebar-header">
                <h1 class="sidebar-logo">Sandouq</h1>
            </div>
            <ul class="sidebar-nav">
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('dashboard')">
                        <i class="fas fa-home"></i>
                        <span>الرئيسية</span>
                    </a>
                </li>
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('members')">
                        <i class="fas fa-users"></i>
                        <span>الأعضاء</span>
                    </a>
                </li>
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('groups')">
                        <i class="fas fa-layer-group"></i>
                        <span>المجموعات</span>
                    </a>
                </li>
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('funds')">
                        <i class="fas fa-piggy-bank"></i>
                        <span>الصناديق</span>
                    </a>
                </li>
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('deposits')">
                        <i class="fas fa-money-check-alt"></i>
                        <span>الإيداعات</span>
                    </a>
                </li>
                <li class="sidebar-nav-item">
                    <a href="#" onclick="navigateTo('reports')">
                        <i class="fas fa-chart-line"></i>
                        <span>التقارير</span>
                    </a>
                </li>
            </ul>
            <div class="sidebar-footer">
                <p>&copy; 2024 Sandouq App</p>
            </div>
        </div>
        <div class="main-content">
            <div class="container" id="page-content">
                <!-- محتوى الصفحة سيتم تحميله هنا -->
            </div>
        </div>
    `;
}

/**
 * تحميل محتوى الصفحة المحدد وتنفيذ دوال التهيئة الخاصة بها.
 * @param {string} page - اسم الصفحة.
 */
function renderPage(page) {
    const contentContainer = document.getElementById('page-content');
    if (!contentContainer) return;

    // دوال عرض المحتوى
    const renderFunctions = {
        'dashboard': renderDashboardPage,
        'members': renderMembersPage,
        'groups': renderGroupsPage,
        'funds': renderFundsPage,
        'deposits': renderDepositsPage, // تم تصحيح الاسم
        'reports': renderReportsPage,
    };

    // دوال التهيئة (لتشغيل الـ Event Listeners)
    const initFunctions = {
        'dashboard': initDashboardPage,
        'members': initMembersPage,
        'groups': initGroupsPage,
        'funds': initFundsPage,
        'deposits': initDepositsPage,
        'reports': initReportsPage,
    };

    if (renderFunctions[page]) {
        contentContainer.innerHTML = renderFunctions[page]();
        // يجب أن يتم استدعاء دالة التهيئة بعد تحميل الـ HTML
        if (initFunctions[page]) {
            initFunctions[page]();
        }
    } else {
        contentContainer.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">خطأ 404</h2>
                <p class="page-subtitle">الصفحة المطلوبة غير موجودة.</p>
            </div>
        `;
    }
}

// ====================================================================================================
// 4. إدارة النوافذ المنبثقة (Modals)
// ====================================================================================================

/**
 * فتح نافذة منبثقة.
 * @param {string} title - عنوان النافذة.
 * @param {string} bodyHtml - محتوى HTML لجسم النافذة.
 * @param {string} footerHtml - محتوى HTML لتذييل النافذة (الأزرار).
 */
function openModal(title, bodyHtml, footerHtml) {
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('modal-content');

    if (!overlay || !content) return;

    content.innerHTML = `
        <div class="modal-header">
            <h3 class="modal-title">${title}</h3>
            <span class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></span>
        </div>
        <div class="modal-body">
            ${bodyHtml}
        </div>
        <div class="modal-footer">
            ${footerHtml}
        </div>
    `;

    overlay.classList.remove('hidden');
    // إضافة مستمع لزر الإغلاق
    document.querySelector('.modal-close').onclick = closeModal;
}

/**
 * إغلاق النافذة المنبثقة.
 */
function closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// ====================================================================================================
// 5. دوال عرض وتهيئة الصفحات (Page Rendering and Initialization)
// ====================================================================================================

// ----------------------------------------------------------------------------------------------------
// 5.1. الصفحة الرئيسية (Dashboard)
// ----------------------------------------------------------------------------------------------------

function renderDashboardPage() {
    const totalMembers = AppState.data.members.length;
    const totalGroups = AppState.data.groups.length;
    const totalFunds = AppState.data.funds.length;
    const totalDeposits = AppState.data.deposits.length;

    const totalBalance = AppState.data.funds.reduce((sum, fund) => sum + fund.balance, 0);
    const totalGoal = AppState.data.funds.reduce((sum, fund) => sum + fund.goal, 0);

    return `
        <div class="page-header">
            <h2 class="page-title">لوحة التحكم</h2>
            <p class="page-subtitle">نظرة عامة سريعة على حالة النظام.</p>
        </div>

        <div class="grid grid-cols-4 gap-lg">
            ${renderStatCard('إجمالي الأعضاء', totalMembers, 'fas fa-users', 'primary')}
            ${renderStatCard('إجمالي المجموعات', totalGroups, 'fas fa-layer-group', 'secondary')}
            ${renderStatCard('إجمالي الصناديق', totalFunds, 'fas fa-piggy-bank', 'success')}
            ${renderStatCard('إجمالي الإيداعات', totalDeposits, 'fas fa-money-check-alt', 'info')}
        </div>

        <div class="card mt-xl">
            <div class="card-header">
                <h3 class="card-title">ملخص الصناديق</h3>
            </div>
            <div class="card-body">
                <div class="grid grid-cols-2 gap-lg">
                    ${renderStatCard('إجمالي الأهداف', `${totalGoal.toLocaleString()} ر.س`, 'fas fa-bullseye', 'primary')}
                    ${renderStatCard('الرصيد الحالي', `${totalBalance.toLocaleString()} ر.س`, 'fas fa-wallet', 'success')}
                </div>
            </div>
        </div>
    `;
}

function renderStatCard(title, value, iconClass, color) {
    return `
        <div class="card">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-muted">${title}</p>
                    <h2 class="text-primary mt-sm">${value}</h2>
                </div>
                <div class="btn-icon btn-${color}-light">
                    <i class="${iconClass} text-${color}"></i>
                </div>
            </div>
        </div>
    `;
}

function initDashboardPage() {
    // لا توجد تهيئة خاصة مطلوبة حاليًا
}

// ----------------------------------------------------------------------------------------------------
// 5.2. صفحة الأعضاء (Members)
// ----------------------------------------------------------------------------------------------------

function renderMembersPage() {
    const membersListHtml = AppState.data.members.map(member => {
        const groupNames = member.groupIds.map(id => {
            const group = AppState.data.groups.find(g => g.id === id);
            return group ? `<span class="badge badge-secondary">${group.name}</span>` : '';
        }).join(' ');

        return `
            <div class="card member-card">
                <div class="member-avatar">${member.name.charAt(0)}</div>
                <div class="member-info">
                    <h4 class="member-name">${member.name}</h4>
                    <p class="member-details">
                        ${member.phone} | ${member.email}
                    </p>
                    <div class="mt-sm flex gap-sm">
                        ${groupNames}
                    </div>
                </div>
                <div class="member-actions">
                    <button class="btn btn-sm btn-outline" onclick="openEditMemberModal(${member.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteMember(${member.id}, '${member.name}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="page-header flex justify-between items-center">
            <div>
                <h2 class="page-title">إدارة الأعضاء</h2>
                <p class="page-subtitle">إجمالي الأعضاء: ${AppState.data.members.length}</p>
            </div>
            <button class="btn btn-primary" onclick="openAddMemberModal()">
                <i class="fas fa-plus"></i> إضافة عضو جديد
            </button>
        </div>

        <div class="grid grid-cols-3 gap-lg" id="members-list">
            ${membersListHtml}
        </div>
    `;
}

function initMembersPage() {
    // لا توجد تهيئة خاصة مطلوبة حاليًا
}

// ----------------------------------------------------------------------------------------------------
// 5.3. صفحة المجموعات (Groups)
// ----------------------------------------------------------------------------------------------------

function renderGroupsPage() {
    const groupsListHtml = AppState.data.groups.map(group => {
        const memberCount = group.members.length;
        const membersList = group.members.map(memberId => {
            const member = AppState.data.members.find(m => m.id === memberId);
            return member ? member.name : 'عضو محذوف';
        }).join(', ');

        return `
            <div class="card">
                <div class="card-header flex justify-between items-center">
                    <h4 class="card-title">${group.name}</h4>
                    <div class="flex gap-sm">
                        <button class="btn btn-sm btn-outline" onclick="openEditGroupModal(${group.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteGroup(${group.id}, '${group.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="text-secondary">${group.description}</p>
                    <p class="text-muted mt-md">
                        <i class="fas fa-users"></i> ${memberCount} أعضاء
                    </p>
                    <p class="text-muted text-sm mt-sm">
                        الأعضاء: ${membersList}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="page-header flex justify-between items-center">
            <div>
                <h2 class="page-title">إدارة المجموعات</h2>
                <p class="page-subtitle">إجمالي المجموعات: ${AppState.data.groups.length}</p>
            </div>
            <button class="btn btn-primary" onclick="openAddGroupModal()">
                <i class="fas fa-plus"></i> إضافة مجموعة جديدة
            </button>
        </div>

        <div class="grid grid-cols-3 gap-lg" id="groups-list">
            ${groupsListHtml}
        </div>
    `;
}

function initGroupsPage() {
    // لا توجد تهيئة خاصة مطلوبة حاليًا
}

// ----------------------------------------------------------------------------------------------------
// 5.4. صفحة الصناديق (Funds)
// ----------------------------------------------------------------------------------------------------

function renderFundsPage() {
    const fundsListHtml = AppState.data.funds.map(fund => {
        const progress = Math.min(100, (fund.balance / fund.goal) * 100).toFixed(0);
        const statusBadge = fund.status === 'مستمر' ? `<span class="badge badge-success">${fund.status}</span>` : `<span class="badge badge-danger">${fund.status}</span>`;

        return `
            <div class="card">
                <div class="card-header flex justify-between items-center">
                    <h4 class="card-title">${fund.name}</h4>
                    <div class="flex gap-sm">
                        <button class="btn btn-sm btn-outline" onclick="openEditFundModal(${fund.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmDeleteFund(${fund.id}, '${fund.name}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <p class="text-secondary">الهدف: ${fund.goal.toLocaleString()} ر.س</p>
                    <p class="text-primary text-lg mt-sm">الرصيد: ${fund.balance.toLocaleString()} ر.س</p>
                    <div class="progress-bar mt-md">
                        <div class="progress-bar-fill" style="width: ${progress}%;"></div>
                    </div>
                    <p class="text-muted text-sm mt-sm">
                        ${progress}% من الهدف
                    </p>
                    <div class="mt-md flex justify-between items-center">
                        ${statusBadge}
                        <span class="text-muted text-sm">ينتهي في: ${fund.endDate}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="page-header flex justify-between items-center">
            <div>
                <h2 class="page-title">إدارة الصناديق</h2>
                <p class="page-subtitle">إجمالي الصناديق: ${AppState.data.funds.length}</p>
            </div>
            <button class="btn btn-primary" onclick="openAddFundModal()">
                <i class="fas fa-plus"></i> إضافة صندوق جديد
            </button>
        </div>

        <div class="grid grid-cols-3 gap-lg" id="funds-list">
            ${fundsListHtml}
        </div>
    `;
}

function initFundsPage() {
    // لا توجد تهيئة خاصة مطلوبة حاليًا
}

// ----------------------------------------------------------------------------------------------------
// 5.5. صفحة الإيداعات (Deposits) - تم تصحيحها بالكامل
// ----------------------------------------------------------------------------------------------------

/**
 * دالة مساعدة لتحديد حالة الدفعة (مكتمل، متأخر، لم يدفع).
 * @param {object} deposit - كائن الدفعة.
 * @returns {object} يحتوي على النص والفئة (class) للشارة.
 */
function getDepositStatus(deposit) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const depositDate = new Date(deposit.date);
    depositDate.setHours(0, 0, 0, 0);

    if (deposit.status === 'مكتمل') {
        return { text: 'مكتمل', class: 'badge-success' };
    }

    // إذا كان تاريخ الدفعة قد مر ولم يتم دفعها
    if (depositDate < today) {
        return { text: 'متأخر', class: 'badge-danger' };
    }

    // إذا لم يمر تاريخ الدفعة بعد
    return { text: 'لم يدفع', class: 'badge-warning' };
}

function renderDepositsPage() {
    const groups = AppState.data.groups;
    const funds = AppState.data.funds;
    const members = AppState.data.members;
    const filters = AppState.filters.deposits;

    // بناء خيارات الفلترة
    const groupOptions = groups.map(g => `<option value="${g.id}">${g.name}</option>`).join('');
    const fundOptions = funds.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    
    // بناء خيارات الأعضاء بناءً على المجموعة المختارة
    let filteredMembers = members;
    if (filters.groupId !== 'all') {
        filteredMembers = members.filter(m => m.groupIds.includes(parseInt(filters.groupId)));
    }
    const memberOptions = filteredMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');

    return `
        <div class="page-header flex justify-between items-center">
            <div>
                <h2 class="page-title">إدارة الإيداعات</h2>
                <p class="page-subtitle">تتبع المدفوعات المستحقة والمكتملة.</p>
            </div>
            <button class="btn btn-primary" onclick="openAddDepositModal()">
                <i class="fas fa-plus"></i> إضافة إيداع جديد
            </button>
        </div>

        <div class="card deposit-filters">
            <div class="card-body">
                <div class="grid grid-cols-4 gap-md">
                    <div class="form-group">
                        <label for="filter-group" class="form-label">المجموعة</label>
                        <select id="filter-group" class="form-control" onchange="handleDepositFilterChange('groupId', this.value)">
                            <option value="all">الكل</option>
                            ${groupOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-fund" class="form-label">الصندوق</label>
                        <select id="filter-fund" class="form-control" onchange="handleDepositFilterChange('fundId', this.value)">
                            <option value="all">الكل</option>
                            ${fundOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-member" class="form-label">العضو</label>
                        <select id="filter-member" class="form-control" onchange="handleDepositFilterChange('memberId', this.value)">
                            <option value="all">الكل</option>
                            ${memberOptions}
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="filter-status" class="form-label">الحالة</label>
                        <select id="filter-status" class="form-control" onchange="handleDepositFilterChange('status', this.value)">
                            <option value="all">الكل</option>
                            <option value="مكتمل">مكتمل</option>
                            <option value="متأخر">متأخر</option>
                            <option value="لم يدفع">لم يدفع</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>المبلغ</th>
                            <th>الصندوق</th>
                            <th>العضو</th>
                            <th>تاريخ الاستحقاق</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="deposits-table-body">
                        ${renderDepositsTableBody()}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

/**
 * دالة مساعدة لعرض صفوف جدول الإيداعات بناءً على الفلاتر.
 */
function renderDepositsTableBody() {
    const filters = AppState.filters.deposits;
    
    const filteredDeposits = AppState.data.deposits.filter(deposit => {
        const member = AppState.data.members.find(m => m.id === deposit.memberId);
        const fund = AppState.data.funds.find(f => f.id === deposit.fundId);
        
        // تطبيق فلتر الصندوق
        if (filters.fundId !== 'all' && fund && fund.id !== parseInt(filters.fundId)) {
            return false;
        }

        // تطبيق فلتر العضو
        if (filters.memberId !== 'all' && member && member.id !== parseInt(filters.memberId)) {
            return false;
        }

        // تطبيق فلتر المجموعة (يتطلب التحقق من أن العضو ينتمي للمجموعة)
        if (filters.groupId !== 'all') {
            const groupId = parseInt(filters.groupId);
            if (!member || !member.groupIds.includes(groupId)) {
                return false;
            }
        }

        // تطبيق فلتر الحالة
        if (filters.status !== 'all') {
            const status = getDepositStatus(deposit).text;
            if (status !== filters.status) {
                return false;
            }
        }

        return true;
    });

    if (filteredDeposits.length === 0) {
        return `<tr><td colspan="6" class="text-center text-muted">لا توجد إيداعات مطابقة لمعايير البحث.</td></tr>`;
    }

    return filteredDeposits.map(deposit => {
        const member = AppState.data.members.find(m => m.id === deposit.memberId);
        const fund = AppState.data.funds.find(f => f.id === deposit.fundId);
        const status = getDepositStatus(deposit);

        return `
            <tr>
                <td>${deposit.amount.toLocaleString()} ر.س</td>
                <td>${fund ? fund.name : 'صندوق محذوف'}</td>
                <td>${member ? member.name : 'عضو محذوف'}</td>
                <td>${deposit.date}</td>
                <td><span class="badge ${status.class}">${status.text}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="openEditDepositModal(${deposit.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="confirmDeleteDeposit(${deposit.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * دالة تهيئة صفحة الإيداعات.
 */
function initDepositsPage() {
    // تهيئة قيم الفلاتر المختارة
    document.getElementById('filter-group').value = AppState.filters.deposits.groupId;
    document.getElementById('filter-fund').value = AppState.filters.deposits.fundId;
    document.getElementById('filter-member').value = AppState.filters.deposits.memberId;
    document.getElementById('filter-status').value = AppState.filters.deposits.status;
}

/**
 * معالجة تغيير الفلاتر وإعادة عرض الجدول.
 * @param {string} filterName - اسم الفلتر الذي تم تغييره.
 * @param {string} value - القيمة الجديدة للفلتر.
 */
function handleDepositFilterChange(filterName, value) {
    AppState.filters.deposits[filterName] = value;
    
    // إذا تم تغيير فلتر المجموعة، يجب إعادة تعيين فلتر العضو وتحديث خيارات الأعضاء
    if (filterName === 'groupId') {
        AppState.filters.deposits.memberId = 'all';
        updateDepositMemberOptions(value);
    }

    // إعادة عرض جسم الجدول فقط
    const tableBody = document.getElementById('deposits-table-body');
    if (tableBody) {
        tableBody.innerHTML = renderDepositsTableBody();
    }
    saveAppState();
}

/**
 * تحديث قائمة خيارات الأعضاء في فلتر الإيداعات بناءً على المجموعة المختارة.
 * @param {string} groupId - معرف المجموعة.
 */
function updateDepositMemberOptions(groupId) {
    const memberSelect = document.getElementById('filter-member');
    if (!memberSelect) return;

    let filteredMembers = AppState.data.members;
    if (groupId !== 'all') {
        filteredMembers = AppState.data.members.filter(m => m.groupIds.includes(parseInt(groupId)));
    }

    let optionsHtml = '<option value="all">الكل</option>';
    optionsHtml += filteredMembers.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    
    memberSelect.innerHTML = optionsHtml;
    memberSelect.value = 'all'; // إعادة تعيين القيمة المختارة
}


// ----------------------------------------------------------------------------------------------------
// 5.6. صفحة التقارير (Reports)
// ----------------------------------------------------------------------------------------------------

function renderReportsPage() {
    return `
        <div class="page-header">
            <h2 class="page-title">التقارير والإحصائيات</h2>
            <p class="page-subtitle">تحليل شامل لحركة الصناديق والإيداعات.</p>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">ملخص الإيداعات</h3>
            </div>
            <div class="card-body" id="reports-content">
                <!-- محتوى التقرير سيتم تحميله هنا بواسطة initReportsPage -->
                <p class="text-center text-muted">جاري تحميل التقرير...</p>
            </div>
        </div>
    `;
}

function initReportsPage() {
    // يتم استدعاء هذه الدالة بعد تحميل الـ HTML
    renderReportsContent();
}

/**
 * دالة عرض محتوى التقارير الفعلية (يتم استدعاؤها بعد تحميل الصفحة).
 */
function renderReportsContent() {
    const container = document.getElementById('reports-content');
    if (!container) return; // تم إصلاح الخطأ: التأكد من وجود العنصر

    const totalDeposits = AppState.data.deposits.length;
    const completedDeposits = AppState.data.deposits.filter(d => getDepositStatus(d).text === 'مكتمل').length;
    const overdueDeposits = AppState.data.deposits.filter(d => getDepositStatus(d).text === 'متأخر').length;
    const pendingDeposits = AppState.data.deposits.filter(d => getDepositStatus(d).text === 'لم يدفع').length;

    const completedAmount = AppState.data.deposits
        .filter(d => getDepositStatus(d).text === 'مكتمل')
        .reduce((sum, d) => sum + d.amount, 0);

    const overdueAmount = AppState.data.deposits
        .filter(d => getDepositStatus(d).text !== 'مكتمل')
        .reduce((sum, d) => sum + d.amount, 0);

    container.innerHTML = `
        <div class="grid grid-cols-3 gap-lg mb-xl">
            <div class="report-stat-card">
                <p class="report-stat-label">إجمالي الإيداعات</p>
                <h4 class="report-stat-value">${totalDeposits}</h4>
            </div>
            <div class="report-stat-card success">
                <p class="report-stat-label">إيداعات مكتملة</p>
                <h4 class="report-stat-value">${completedDeposits}</h4>
            </div>
            <div class="report-stat-card danger">
                <p class="report-stat-label">إيداعات متأخرة</p>
                <h4 class="report-stat-value">${overdueDeposits}</h4>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-lg">
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">المبالغ المكتملة</h4>
                </div>
                <div class="card-body">
                    <p class="text-success text-2xl">${completedAmount.toLocaleString()} ر.س</p>
                    <p class="text-muted mt-sm">إجمالي المبالغ التي تم تحصيلها حتى الآن.</p>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h4 class="card-title">المبالغ المستحقة/المتأخرة</h4>
                </div>
                <div class="card-body">
                    <p class="text-danger text-2xl">${overdueAmount.toLocaleString()} ر.س</p>
                    <p class="text-muted mt-sm">إجمالي المبالغ التي لم يتم تحصيلها بعد.</p>
                </div>
            </div>
        </div>
    `;
}

// ====================================================================================================
// 6. دوال إدارة البيانات (CRUD Operations)
// ====================================================================================================

// ----------------------------------------------------------------------------------------------------
// 6.1. الأعضاء (Members)
// ----------------------------------------------------------------------------------------------------

function openAddMemberModal() {
    const groupOptions = AppState.data.groups.map(g => `
        <label class="form-label flex items-center gap-sm">
            <input type="checkbox" name="member-groups" value="${g.id}"> ${g.name}
        </label>
    `).join('');

    const body = `
        <form id="add-member-form">
            <div class="form-group">
                <label for="member-name" class="form-label">الاسم الكامل</label>
                <input type="text" id="member-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="member-phone" class="form-label">رقم الهاتف</label>
                <input type="tel" id="member-phone" class="form-control">
            </div>
            <div class="form-group">
                <label for="member-email" class="form-label">البريد الإلكتروني</label>
                <input type="email" id="member-email" class="form-control">
            </div>
            <div class="form-group">
                <label class="form-label">المجموعات</label>
                <div class="flex flex-col gap-sm">
                    ${groupOptions}
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="addMember()">إضافة</button>
    `;
    openModal('إضافة عضو جديد', body, footer);
}

function addMember() {
    const name = document.getElementById('member-name').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const groupCheckboxes = document.querySelectorAll('#add-member-form input[name="member-groups"]:checked');
    const groupIds = Array.from(groupCheckboxes).map(cb => parseInt(cb.value));

    if (!name) {
        showToast('الرجاء إدخال اسم العضو.', 'danger');
        return;
    }

    const newMember = {
        id: getNextId('member'),
        name,
        phone,
        email,
        groupIds,
    };

    AppState.data.members.push(newMember);

    // تحديث قائمة الأعضاء في المجموعات
    groupIds.forEach(groupId => {
        const group = AppState.data.groups.find(g => g.id === groupId);
        if (group && !group.members.includes(newMember.id)) {
            group.members.push(newMember.id);
        }
    });

    saveAppState();
    closeModal();
    showToast('تم إضافة العضو بنجاح.', 'success');
    renderApp();
}

function openEditMemberModal(memberId) {
    const member = AppState.data.members.find(m => m.id === memberId);
    if (!member) return;

    const groupOptions = AppState.data.groups.map(g => {
        const isChecked = member.groupIds.includes(g.id) ? 'checked' : '';
        return `
            <label class="form-label flex items-center gap-sm">
                <input type="checkbox" name="member-groups" value="${g.id}" ${isChecked}> ${g.name}
            </label>
        `;
    }).join('');

    const body = `
        <form id="edit-member-form">
            <input type="hidden" id="edit-member-id" value="${member.id}">
            <div class="form-group">
                <label for="edit-member-name" class="form-label">الاسم الكامل</label>
                <input type="text" id="edit-member-name" class="form-control" value="${member.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-member-phone" class="form-label">رقم الهاتف</label>
                <input type="tel" id="edit-member-phone" class="form-control" value="${member.phone || ''}">
            </div>
            <div class="form-group">
                <label for="edit-member-email" class="form-label">البريد الإلكتروني</label>
                <input type="email" id="edit-member-email" class="form-control" value="${member.email || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">المجموعات</label>
                <div class="flex flex-col gap-sm">
                    ${groupOptions}
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="editMember()">حفظ التعديلات</button>
    `;
    openModal('تعديل بيانات العضو', body, footer);
}

function editMember() {
    const memberId = parseInt(document.getElementById('edit-member-id').value);
    const member = AppState.data.members.find(m => m.id === memberId);
    if (!member) return;

    const newName = document.getElementById('edit-member-name').value.trim();
    const newPhone = document.getElementById('edit-member-phone').value.trim();
    const newEmail = document.getElementById('edit-member-email').value.trim();
    const groupCheckboxes = document.querySelectorAll('#edit-member-form input[name="member-groups"]:checked');
    const newGroupIds = Array.from(groupCheckboxes).map(cb => parseInt(cb.value));

    if (!newName) {
        showToast('الرجاء إدخال اسم العضو.', 'danger');
        return;
    }

    // تحديث بيانات العضو
    member.name = newName;
    member.phone = newPhone;
    member.email = newEmail;

    // تحديث المجموعات
    const oldGroupIds = member.groupIds;
    member.groupIds = newGroupIds;

    // إزالة العضو من المجموعات التي لم يعد ينتمي إليها
    oldGroupIds.forEach(groupId => {
        if (!newGroupIds.includes(groupId)) {
            const group = AppState.data.groups.find(g => g.id === groupId);
            if (group) {
                group.members = group.members.filter(mId => mId !== memberId);
            }
        }
    });

    // إضافة العضو إلى المجموعات الجديدة
    newGroupIds.forEach(groupId => {
        if (!oldGroupIds.includes(groupId)) {
            const group = AppState.data.groups.find(g => g.id === groupId);
            if (group && !group.members.includes(memberId)) {
                group.members.push(memberId);
            }
        }
    });

    saveAppState();
    closeModal();
    showToast('تم تحديث بيانات العضو بنجاح.', 'success');
    renderApp();
}

function confirmDeleteMember(memberId, memberName) {
    const body = `<p>هل أنت متأكد من حذف العضو <strong>${memberName}</strong>؟ سيتم حذف جميع الإيداعات المرتبطة به.</p>`;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-danger" onclick="deleteMember(${memberId})">حذف</button>
    `;
    openModal('تأكيد الحذف', body, footer);
}

function deleteMember(memberId) {
    // 1. حذف العضو من قائمة الأعضاء
    AppState.data.members = AppState.data.members.filter(m => m.id !== memberId);

    // 2. حذف العضو من جميع المجموعات
    AppState.data.groups.forEach(group => {
        group.members = group.members.filter(mId => mId !== memberId);
    });

    // 3. حذف جميع الإيداعات المرتبطة بالعضو
    AppState.data.deposits = AppState.data.deposits.filter(d => d.memberId !== memberId);

    saveAppState();
    closeModal();
    showToast('تم حذف العضو والإيداعات المرتبطة به بنجاح.', 'success');
    renderApp();
}

// ----------------------------------------------------------------------------------------------------
// 6.2. المجموعات (Groups)
// ----------------------------------------------------------------------------------------------------

function openAddGroupModal() {
    const memberOptions = AppState.data.members.map(m => `
        <label class="form-label flex items-center gap-sm">
            <input type="checkbox" name="group-members" value="${m.id}"> ${m.name}
        </label>
    `).join('');

    const body = `
        <form id="add-group-form">
            <div class="form-group">
                <label for="group-name" class="form-label">اسم المجموعة</label>
                <input type="text" id="group-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="group-description" class="form-label">الوصف</label>
                <textarea id="group-description" class="form-control"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">الأعضاء</label>
                <div class="flex flex-col gap-sm" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: var(--spacing-sm); border-radius: var(--border-radius-sm);">
                    ${memberOptions}
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="addGroup()">إضافة</button>
    `;
    openModal('إضافة مجموعة جديدة', body, footer);
}

function addGroup() {
    const name = document.getElementById('group-name').value.trim();
    const description = document.getElementById('group-description').value.trim();
    const memberCheckboxes = document.querySelectorAll('#add-group-form input[name="group-members"]:checked');
    const memberIds = Array.from(memberCheckboxes).map(cb => parseInt(cb.value));

    if (!name) {
        showToast('الرجاء إدخال اسم المجموعة.', 'danger');
        return;
    }

    const newGroup = {
        id: getNextId('group'),
        name,
        description,
        members: memberIds,
    };

    AppState.data.groups.push(newGroup);

    // تحديث قائمة المجموعات لكل عضو
    memberIds.forEach(memberId => {
        const member = AppState.data.members.find(m => m.id === memberId);
        if (member && !member.groupIds.includes(newGroup.id)) {
            member.groupIds.push(newGroup.id);
        }
    });

    saveAppState();
    closeModal();
    showToast('تم إضافة المجموعة بنجاح.', 'success');
    renderApp();
}

function openEditGroupModal(groupId) {
    const group = AppState.data.groups.find(g => g.id === groupId);
    if (!group) return;

    const memberOptions = AppState.data.members.map(m => {
        const isChecked = group.members.includes(m.id) ? 'checked' : '';
        return `
            <label class="form-label flex items-center gap-sm">
                <input type="checkbox" name="group-members" value="${m.id}" ${isChecked}> ${m.name}
            </label>
        `;
    }).join('');

    const body = `
        <form id="edit-group-form">
            <input type="hidden" id="edit-group-id" value="${group.id}">
            <div class="form-group">
                <label for="edit-group-name" class="form-label">اسم المجموعة</label>
                <input type="text" id="edit-group-name" class="form-control" value="${group.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-group-description" class="form-label">الوصف</label>
                <textarea id="edit-group-description" class="form-control">${group.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">الأعضاء</label>
                <div class="flex flex-col gap-sm" style="max-height: 150px; overflow-y: auto; border: 1px solid var(--border-color); padding: var(--spacing-sm); border-radius: var(--border-radius-sm);">
                    ${memberOptions}
                </div>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="editGroup()">حفظ التعديلات</button>
    `;
    openModal('تعديل بيانات المجموعة', body, footer);
}

function editGroup() {
    const groupId = parseInt(document.getElementById('edit-group-id').value);
    const group = AppState.data.groups.find(g => g.id === groupId);
    if (!group) return;

    const newName = document.getElementById('edit-group-name').value.trim();
    const newDescription = document.getElementById('edit-group-description').value.trim();
    const memberCheckboxes = document.querySelectorAll('#edit-group-form input[name="group-members"]:checked');
    const newMemberIds = Array.from(memberCheckboxes).map(cb => parseInt(cb.value));

    if (!newName) {
        showToast('الرجاء إدخال اسم المجموعة.', 'danger');
        return;
    }

    // تحديث بيانات المجموعة
    group.name = newName;
    group.description = newDescription;

    // تحديث المجموعات للأعضاء
    const oldMemberIds = group.members;
    group.members = newMemberIds;

    // إزالة المجموعة من الأعضاء الذين لم يعودوا ينتمون إليها
    oldMemberIds.forEach(memberId => {
        if (!newMemberIds.includes(memberId)) {
            const member = AppState.data.members.find(m => m.id === memberId);
            if (member) {
                member.groupIds = member.groupIds.filter(gId => gId !== groupId);
            }
        }
    });

    // إضافة المجموعة للأعضاء الجدد
    newMemberIds.forEach(memberId => {
        if (!oldMemberIds.includes(memberId)) {
            const member = AppState.data.members.find(m => m.id === memberId);
            if (member && !member.groupIds.includes(groupId)) {
                member.groupIds.push(groupId);
            }
        }
    });

    saveAppState();
    closeModal();
    showToast('تم تحديث بيانات المجموعة بنجاح.', 'success');
    renderApp();
}

function confirmDeleteGroup(groupId, groupName) {
    const body = `<p>هل أنت متأكد من حذف المجموعة <strong>${groupName}</strong>؟ لن يتم حذف الأعضاء أو الصناديق المرتبطة بها، ولكن سيتم إزالة ارتباطهم بهذه المجموعة.</p>`;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-danger" onclick="deleteGroup(${groupId})">حذف</button>
    `;
    openModal('تأكيد الحذف', body, footer);
}

function deleteGroup(groupId) {
    // 1. حذف المجموعة من قائمة المجموعات
    // تم تصحيح الخطأ هنا
    AppState.data.groups = (AppState.data.groups || []).filter(g => g.id !== groupId);

    // 2. إزالة المجموعة من قائمة groupIds لكل عضو
    AppState.data.members.forEach(member => {
        member.groupIds = member.groupIds.filter(gId => gId !== groupId);
    });

    saveAppState();
    closeModal();
    showToast('تم حذف المجموعة بنجاح.', 'success');
    renderApp();
}

// ----------------------------------------------------------------------------------------------------
// 6.3. الصناديق (Funds)
// ----------------------------------------------------------------------------------------------------

function openAddFundModal() {
    const body = `
        <form id="add-fund-form">
            <div class="form-group">
                <label for="fund-name" class="form-label">اسم الصندوق</label>
                <input type="text" id="fund-name" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="fund-goal" class="form-label">الهدف المالي (ر.س)</label>
                <input type="number" id="fund-goal" class="form-control" min="0" required>
            </div>
            <div class="form-group">
                <label for="fund-start-date" class="form-label">تاريخ البدء</label>
                <input type="date" id="fund-start-date" class="form-control" required>
            </div>
            <div class="form-group">
                <label for="fund-end-date" class="form-label">تاريخ الانتهاء المتوقع</label>
                <input type="date" id="fund-end-date" class="form-control" required>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="addFund()">إضافة</button>
    `;
    openModal('إضافة صندوق جديد', body, footer);
}

function addFund() {
    const name = document.getElementById('fund-name').value.trim();
    const goal = parseFloat(document.getElementById('fund-goal').value);
    const startDate = document.getElementById('fund-start-date').value;
    const endDate = document.getElementById('fund-end-date').value;

    if (!name || isNaN(goal) || goal <= 0 || !startDate || !endDate) {
        showToast('الرجاء إدخال جميع البيانات بشكل صحيح.', 'danger');
        return;
    }

    const newFund = {
        id: getNextId('fund'),
        name,
        goal,
        balance: 0, // يبدأ الرصيد بـ 0
        startDate,
        endDate,
        status: 'مستمر',
    };

    AppState.data.funds.push(newFund);
    saveAppState();
    closeModal();
    showToast('تم إضافة الصندوق بنجاح.', 'success');
    renderApp();
}

function openEditFundModal(fundId) {
    const fund = AppState.data.funds.find(f => f.id === fundId);
    if (!fund) return;

    const statusOptions = ['مستمر', 'مكتمل', 'متوقف'].map(s => 
        `<option value="${s}" ${fund.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const body = `
        <form id="edit-fund-form">
            <input type="hidden" id="edit-fund-id" value="${fund.id}">
            <div class="form-group">
                <label for="edit-fund-name" class="form-label">اسم الصندوق</label>
                <input type="text" id="edit-fund-name" class="form-control" value="${fund.name}" required>
            </div>
            <div class="form-group">
                <label for="edit-fund-goal" class="form-label">الهدف المالي (ر.س)</label>
                <input type="number" id="edit-fund-goal" class="form-control" value="${fund.goal}" min="0" required>
            </div>
            <div class="form-group">
                <label for="edit-fund-start-date" class="form-label">تاريخ البدء</label>
                <input type="date" id="edit-fund-start-date" class="form-control" value="${fund.startDate}" required>
            </div>
            <div class="form-group">
                <label for="edit-fund-end-date" class="form-label">تاريخ الانتهاء المتوقع</label>
                <input type="date" id="edit-fund-end-date" class="form-control" value="${fund.endDate}" required>
            </div>
            <div class="form-group">
                <label for="edit-fund-status" class="form-label">الحالة</label>
                <select id="edit-fund-status" class="form-control">
                    ${statusOptions}
                </select>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="editFund()">حفظ التعديلات</button>
    `;
    openModal('تعديل بيانات الصندوق', body, footer);
}

function editFund() {
    const fundId = parseInt(document.getElementById('edit-fund-id').value);
    const fund = AppState.data.funds.find(f => f.id === fundId);
    if (!fund) return;

    const newName = document.getElementById('edit-fund-name').value.trim();
    const newGoal = parseFloat(document.getElementById('edit-fund-goal').value);
    const newStartDate = document.getElementById('edit-fund-start-date').value;
    const newEndDate = document.getElementById('edit-fund-end-date').value;
    const newStatus = document.getElementById('edit-fund-status').value;

    if (!newName || isNaN(newGoal) || newGoal <= 0 || !newStartDate || !newEndDate) {
        showToast('الرجاء إدخال جميع البيانات بشكل صحيح.', 'danger');
        return;
    }

    fund.name = newName;
    fund.goal = newGoal;
    fund.startDate = newStartDate;
    fund.endDate = newEndDate;
    fund.status = newStatus;

    saveAppState();
    closeModal();
    showToast('تم تحديث بيانات الصندوق بنجاح.', 'success');
    renderApp();
}

function confirmDeleteFund(fundId, fundName) {
    const body = `<p>هل أنت متأكد من حذف الصندوق <strong>${fundName}</strong>؟ سيتم حذف جميع الإيداعات المرتبطة به.</p>`;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-danger" onclick="deleteFund(${fundId})">حذف</button>
    `;
    openModal('تأكيد الحذف', body, footer);
}

function deleteFund(fundId) {
    // 1. حذف الصندوق من قائمة الصناديق
    // تم تصحيح الخطأ هنا
    AppState.data.funds = (AppState.data.funds || []).filter(f => f.id !== fundId);

    // 2. حذف جميع الإيداعات المرتبطة بالصندوق
    // تم تصحيح الخطأ هنا
    AppState.data.deposits = (AppState.data.deposits || []).filter(d => d.fundId !== fundId);

    saveAppState();
    closeModal();
    showToast('تم حذف الصندوق والإيداعات المرتبطة به بنجاح.', 'success');
    renderApp();
}

// ----------------------------------------------------------------------------------------------------
// 6.4. الإيداعات (Deposits)
// ----------------------------------------------------------------------------------------------------

function openAddDepositModal() {
    const memberOptions = AppState.data.members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    const fundOptions = AppState.data.funds.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
    const today = new Date().toISOString().split('T')[0];

    const body = `
        <form id="add-deposit-form">
            <div class="form-group">
                <label for="deposit-member" class="form-label">العضو</label>
                <select id="deposit-member" class="form-control" required>
                    <option value="">اختر عضو...</option>
                    ${memberOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="deposit-fund" class="form-label">الصندوق</label>
                <select id="deposit-fund" class="form-control" required>
                    <option value="">اختر صندوق...</option>
                    ${fundOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="deposit-amount" class="form-label">المبلغ (ر.س)</label>
                <input type="number" id="deposit-amount" class="form-control" min="1" required>
            </div>
            <div class="form-group">
                <label for="deposit-date" class="form-label">تاريخ الاستحقاق</label>
                <input type="date" id="deposit-date" class="form-control" value="${today}" required>
            </div>
            <div class="form-group">
                <label for="deposit-status" class="form-label">الحالة</label>
                <select id="deposit-status" class="form-control" required>
                    <option value="لم يدفع">لم يدفع</option>
                    <option value="مكتمل">مكتمل</option>
                </select>
            </div>
            <div class="form-group">
                <label for="deposit-notes" class="form-label">ملاحظات</label>
                <textarea id="deposit-notes" class="form-control"></textarea>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="addDeposit()">إضافة</button>
    `;
    openModal('إضافة إيداع جديد', body, footer);
}

function addDeposit() {
    const memberId = parseInt(document.getElementById('deposit-member').value);
    const fundId = parseInt(document.getElementById('deposit-fund').value);
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    const date = document.getElementById('deposit-date').value;
    const status = document.getElementById('deposit-status').value;
    const notes = document.getElementById('deposit-notes').value.trim();

    if (!memberId || !fundId || isNaN(amount) || amount <= 0 || !date) {
        showToast('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح.', 'danger');
        return;
    }

    const newDeposit = {
        id: getNextId('deposit'),
        memberId,
        fundId,
        amount,
        date,
        status,
        notes,
    };

    AppState.data.deposits.push(newDeposit);

    // تحديث رصيد الصندوق إذا كانت الحالة "مكتمل"
    if (status === 'مكتمل') {
        const fund = AppState.data.funds.find(f => f.id === fundId);
        if (fund) {
            fund.balance += amount;
        }
    }

    saveAppState();
    closeModal();
    showToast('تم إضافة الإيداع بنجاح.', 'success');
    renderApp();
}

function openEditDepositModal(depositId) {
    const deposit = AppState.data.deposits.find(d => d.id === depositId);
    if (!deposit) return;

    const memberOptions = AppState.data.members.map(m => 
        `<option value="${m.id}" ${deposit.memberId === m.id ? 'selected' : ''}>${m.name}</option>`
    ).join('');
    const fundOptions = AppState.data.funds.map(f => 
        `<option value="${f.id}" ${deposit.fundId === f.id ? 'selected' : ''}>${f.name}</option>`
    ).join('');
    
    const statusOptions = ['لم يدفع', 'مكتمل'].map(s => 
        `<option value="${s}" ${deposit.status === s ? 'selected' : ''}>${s}</option>`
    ).join('');

    const body = `
        <form id="edit-deposit-form">
            <input type="hidden" id="edit-deposit-id" value="${deposit.id}">
            <div class="form-group">
                <label for="edit-deposit-member" class="form-label">العضو</label>
                <select id="edit-deposit-member" class="form-control" required disabled>
                    ${memberOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="edit-deposit-fund" class="form-label">الصندوق</label>
                <select id="edit-deposit-fund" class="form-control" required disabled>
                    ${fundOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="edit-deposit-amount" class="form-label">المبلغ (ر.س)</label>
                <input type="number" id="edit-deposit-amount" class="form-control" value="${deposit.amount}" min="1" required>
            </div>
            <div class="form-group">
                <label for="edit-deposit-date" class="form-label">تاريخ الاستحقاق</label>
                <input type="date" id="edit-deposit-date" class="form-control" value="${deposit.date}" required>
            </div>
            <div class="form-group">
                <label for="edit-deposit-status" class="form-label">الحالة</label>
                <select id="edit-deposit-status" class="form-control" required>
                    ${statusOptions}
                </select>
            </div>
            <div class="form-group">
                <label for="edit-deposit-notes" class="form-label">ملاحظات</label>
                <textarea id="edit-deposit-notes" class="form-control">${deposit.notes || ''}</textarea>
            </div>
        </form>
    `;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-primary" onclick="editDeposit()">حفظ التعديلات</button>
    `;
    openModal('تعديل بيانات الإيداع', body, footer);
}

function editDeposit() {
    const depositId = parseInt(document.getElementById('edit-deposit-id').value);
    const deposit = AppState.data.deposits.find(d => d.id === depositId);
    if (!deposit) return;

    const oldAmount = deposit.amount;
    const oldStatus = deposit.status;
    const fundId = deposit.fundId; // لا يمكن تغيير الصندوق أو العضو بعد الإنشاء

    const newAmount = parseFloat(document.getElementById('edit-deposit-amount').value);
    const newDate = document.getElementById('edit-deposit-date').value;
    const newStatus = document.getElementById('edit-deposit-status').value;
    const newNotes = document.getElementById('edit-deposit-notes').value.trim();

    if (isNaN(newAmount) || newAmount <= 0 || !newDate) {
        showToast('الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح.', 'danger');
        return;
    }

    // تحديث رصيد الصندوق بناءً على التغييرات
    const fund = AppState.data.funds.find(f => f.id === fundId);
    if (fund) {
        // 1. عكس تأثير الحالة القديمة
        if (oldStatus === 'مكتمل') {
            fund.balance -= oldAmount;
        }

        // 2. تطبيق التغييرات على الدفعة
        deposit.amount = newAmount;
        deposit.date = newDate;
        deposit.status = newStatus;
        deposit.notes = newNotes;

        // 3. تطبيق تأثير الحالة الجديدة
        if (newStatus === 'مكتمل') {
            fund.balance += newAmount;
        }
    } else {
        // تطبيق التغييرات على الدفعة فقط إذا لم يتم العثور على الصندوق
        deposit.amount = newAmount;
        deposit.date = newDate;
        deposit.status = newStatus;
        deposit.notes = newNotes;
    }

    saveAppState();
    closeModal();
    showToast('تم تحديث بيانات الإيداع بنجاح.', 'success');
    renderApp();
}

function confirmDeleteDeposit(depositId) {
    const deposit = AppState.data.deposits.find(d => d.id === depositId);
    if (!deposit) return;

    const body = `<p>هل أنت متأكد من حذف الإيداع بمبلغ <strong>${deposit.amount.toLocaleString()} ر.س</strong>؟</p>`;
    const footer = `
        <button class="btn btn-ghost" onclick="closeModal()">إلغاء</button>
        <button class="btn btn-danger" onclick="deleteDeposit(${depositId})">حذف</button>
    `;
    openModal('تأكيد الحذف', body, footer);
}

function deleteDeposit(depositId) {
    const deposit = AppState.data.deposits.find(d => d.id === depositId);
    if (!deposit) return;

    // 1. تحديث رصيد الصندوق إذا كانت الدفعة مكتملة
    if (deposit.status === 'مكتمل') {
        const fund = AppState.data.funds.find(f => f.id === deposit.fundId);
        if (fund) {
            fund.balance -= deposit.amount;
        }
    }

    // 2. حذف الإيداع من القائمة
    // تم تصحيح الخطأ هنا
    AppState.data.deposits = (AppState.data.deposits || []).filter(d => d.id !== depositId);

    saveAppState();
    closeModal();
    showToast('تم حذف الإيداع بنجاح.', 'success');
    renderApp();
}

// ====================================================================================================
// 7. التهيئة الأولية (Initial Setup)
// ====================================================================================================

/**
 * دالة التهيئة التي يتم استدعاؤها عند تحميل الصفحة.
 */
function initializeApp() {
    loadAppState();
    renderApp();
}

// بدء تشغيل التطبيق عند تحميل DOM
document.addEventListener('DOMContentLoaded', initializeApp);
