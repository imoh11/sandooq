// ==================== دوال مساعدة لتنسيق التاريخ ====================

/**
 * تحويل التاريخ إلى تنسيق ISO (YYYY-MM-DD)
 * @param {Date|string} date - التاريخ المراد تحويله
 * @returns {string} التاريخ بتنسيق YYYY-MM-DD
 */
function toISODateString(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
}

/**
 * تحويل التاريخ إلى تنسيق عرض محلي
 * @param {string} dateString - التاريخ بصيغة string
 * @returns {string} التاريخ بتنسيق YYYY-MM-DD
 */
function toLocaleDateStringAR(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA');
}

/**
 * تنسيق التاريخ الميلادي للعرض
 * @param {Date} date - التاريخ المراد تنسيقه
 * @returns {string} التاريخ بتنسيق YYYY-MM-DD
 */
function formatGregorianDate(date = new Date()) {
    // تنسيق التاريخ الميلادي (مثال: ٢٠/٧/٢٠٢٤ م)
    const gregorianFormatter = new Intl.DateTimeFormat('ar-EG', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
    return gregorianFormatter.format(date);
}

/**
 * تنسيق التاريخ للعرض
 * @param {Date|string} date - التاريخ المراد تنسيقه
 * @returns {string} التاريخ الهجري المنسق
 */
function formatHijriDate(date = new Date()) {
    // تنسيق التاريخ الهجري (مثال: ١٤/١/١٤٤٦ هـ)
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
    });
    return hijriFormatter.format(date);
}

// ==================== دوال التخزين المحلي ====================

/**
 * قراءة البيانات من التخزين المحلي
 * @param {string} key - مفتاح البيانات
 * @param {*} defaultValue - القيمة الافتراضية إذا لم توجد البيانات
 * @returns {*} البيانات المخزنة أو القيمة الافتراضية
 */
function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('خطأ في قراءة التخزين:', e);
        return defaultValue;
    }
}

/**
 * حفظ البيانات في التخزين المحلي
 * @param {string} key - مفتاح البيانات
 * @param {*} value - القيمة المراد حفظها
 * @returns {boolean} true إذا نجح الحفظ
 */
function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('خطأ في حفظ البيانات:', e);
        return false;
    }
}

/**
 * حذف البيانات من التخزين المحلي
 * @param {string} key - مفتاح البيانات
 * @returns {boolean} true إذا نجح الحذف
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('خطأ في حذف البيانات:', e);
        return false;
    }
}

// ==================== تهيئة البيانات الأولية ====================

/**
 * تهيئة البيانات الأولية في التخزين المحلي
 */
function initializeData() {
    if (!getFromStorage('members')) {
        saveToStorage('members', []);
    }
    if (!getFromStorage('deposits')) {
        saveToStorage('deposits', []);
    }
    if (!getFromStorage('withdrawals')) {
        saveToStorage('withdrawals', []);
    }
    if (!getFromStorage('teams')) {
        saveToStorage('teams', []);
    }
    if (!getFromStorage('boxes')) {
        saveToStorage('boxes', []);
    }
    if (!getFromStorage('groups')) {
        saveToStorage('groups', []);
    }
}








function populateDropdownsForModal() {
    const funds = getFromStorage('boxes', []); // ⭐️ تصحيح: استخدام 'boxes' بدلاً من 'funds'
    const fundSelect = document.getElementById('deposit-fund');

    fundSelect.innerHTML = '<option value="">اختر الصندوق</option>'; // النص النائب
    funds.forEach(fund => fundSelect.innerHTML += `<option value="${fund.id}">${fund.name}</option>`);
}

// ==================== إدارة الفرق ====================

/**
 * إضافة فريق جديد
 * @param {string} name - اسم الفريق
 * @returns {object} الفريق المضاف
 */
function addTeam(name) {
    const teams = getFromStorage('teams', []);
    const newTeam = {
        id: Date.now(),
        name: name,
        createdDate: toISODateString(new Date()),
        members: []
    };
    teams.push(newTeam);
    saveToStorage('teams', teams);
    showAlert('تم إضافة الفريق بنجاح', 'success');
    return newTeam;
}

/**
 * الحصول على جميع الفرق
 * @returns {Array} قائمة الفرق
 */
function getAllTeams() {
    return getFromStorage('teams', []);
}

/**
 * حذف فريق
 * @param {number} teamId - معرف الفريق
 */
function deleteTeam(teamId) {
    const teams = getFromStorage('teams', []);
    const filtered = teams.filter(t => t.id !== teamId);
    saveToStorage('teams', filtered);
    showAlert('تم حذف الفريق بنجاح', 'success');
}

// ==================== إدارة الصناديق ====================

/**
 * حساب إجمالي المبالغ المحصلة لصندوق معين
 * @param {number} boxId - معرف الصندوق
 * @returns {number} المبلغ الإجمالي المحصل
 */
function calculateBoxCollectedAmount(boxId) {
    const deposits = getFromStorage('deposits', []);
    return deposits.filter(d => d.boxId === boxId).reduce((sum, d) => sum + parseFloat(d.amount), 0);
}

/**
 * حساب المبلغ المتوقع لصندوق معين (دورة واحدة)
 * @param {number} boxId - معرف الصندوق
 * @returns {number} المبلغ المتوقع
 */
function calculateBoxPotentialAmount(boxId) {
    const box = getAllBoxes().find(b => b.id === boxId);
    if (!box) return 0;

    const members = getAllMembers();
    const membersInBox = members.filter(m => m.boxes && m.boxes.includes(boxId));

    return box.amount * membersInBox.length;
}

/**
 * إضافة صندوق جديد
 * @param {string} name - اسم الصندوق
 * @param {number} amount - مبلغ الدفعة
 * @param {Array} teams - الفرق المشاركة
 * @param {string} frequency - تكرار الاستحقاق
 * @returns {object} الصندوق المضاف
 */
function addBox(name, amount, teams, frequency) {
    const boxes = getFromStorage('boxes', []);
    const newBox = {
        id: Date.now(),
        name: name,
        amount: parseFloat(amount),
        teams: teams,
        frequency: frequency,
        nextDueDate: calculateNextDueDate(frequency) || null,
        createdDate: toISODateString(new Date())
    };
    boxes.push(newBox);
    saveToStorage('boxes', boxes);
    showAlert('تم إضافة الصندوق بنجاح', 'success');
    return newBox;
}

/**
 * حساب تاريخ الاستحقاق التالي بناءً على التكرار
 * @param {string} frequency - نوع التكرار (monthly, quarterly, annual)
 * @returns {string} تاريخ الاستحقاق التالي بتنسيق YYYY-MM-DD
 */
function calculateNextDueDate(frequency) {
    const today = new Date();
    let nextDate = new Date(today);

    if (frequency === 'monthly') {
        nextDate.setMonth(nextDate.getMonth() + 1);
    } else if (frequency === 'quarterly') {
        nextDate.setMonth(nextDate.getMonth() + 3);
    } else if (frequency === 'annual') {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
    }

    return toISODateString(nextDate);
}

/**
 * الحصول على تسمية نوع الاستحقاق بالعربية
 * @param {string} frequency - نوع الاستحقاق
 * @returns {string} التسمية بالعربية
 */
function getFrequencyLabel(frequency) {
    const labels = {
        'monthly': 'شهري',
        'quarterly': 'ربع سنوي',
        'annual': 'سنوي'
    };
    return labels[frequency] || frequency;
}

/**
 * الحصول على جميع الصناديق
 * @returns {Array} قائمة الصناديق
 */
function getAllBoxes() {
    return getFromStorage('boxes', []);
}

/**
 * حذف صندوق
 * @param {number} boxId - معرف الصندوق
 */
function deleteBox(boxId) {
    const boxes = getFromStorage('boxes', []);
    const filtered = boxes.filter(b => b.id !== boxId);
    saveToStorage('boxes', filtered);
    showAlert('تم حذف الصندوق بنجاح', 'success');
}

/**
 * تحديث تاريخ استحقاق صندوق
 * @param {number} boxId - معرف الصندوق
 * @param {string} newDate - التاريخ الجديد
 */
function updateBoxDueDate(boxId, newDate) {
    const boxes = getFromStorage('boxes', []);
    const box = boxes.find(b => b.id === boxId);
    if (box) {
        box.nextDueDate = newDate;
        saveToStorage('boxes', boxes);
    }
}

/**
 * تحديث بيانات صندوق
 * @param {number} boxId - معرف الصندوق
 * @param {object} updatedData - البيانات المحدثة
 * @returns {boolean} true إذا نجح التحديث
 */
function updateBox(boxId, updatedData) {
    const boxes = getFromStorage('boxes', []);
    const index = boxes.findIndex(b => b.id === boxId);

    if (index !== -1) {
        const oldBox = { ...boxes[index] };
        boxes[index] = { ...boxes[index], ...updatedData };

        // منطق تحديث تاريخ الاستحقاق التالي
        if (updatedData.hasOwnProperty('nextDueDate')) {
            boxes[index].nextDueDate = updatedData.nextDueDate === '' ? null : updatedData.nextDueDate;
        } else if (updatedData.frequency && updatedData.frequency !== oldBox.frequency) {
            boxes[index].nextDueDate = calculateNextDueDate(boxes[index].frequency) || null;
        } else if (!boxes[index].nextDueDate) {
            boxes[index].nextDueDate = calculateNextDueDate(boxes[index].frequency) || null;
        }

        saveToStorage('boxes', boxes);
        showAlert('تم تحديث الصندوق بنجاح', 'success');
        return true;
    }
    return false;
}

// ==================== إدارة المجموعات ====================

/**
 * إضافة مجموعة جديدة
 * @param {string} name - اسم المجموعة
 * @returns {object} المجموعة المضافة
 */
function addGroup(name) {
    const groups = getFromStorage('groups', []);
    const newGroup = {
        id: Date.now(),
        name: name,
        createdDate: toISODateString(new Date())
    };
    groups.push(newGroup);
    saveToStorage('groups', groups);
    return newGroup;
}

/**
 * الحصول على جميع المجموعات
 * @returns {Array} قائمة المجموعات
 */
function getAllGroups() {
    return getFromStorage('groups', []);
}

/**
 * استيراد مجموعات من نص
 * @param {string} text - النص الذي يحتوي على أسماء المجموعات (سطر لكل مجموعة)
 */
function importGroupsFromText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let count = 0;
    lines.forEach(line => {
        const groupName = line.trim();
        if (groupName) {
            addGroup(groupName);
            count++;
        }
    });
    showAlert(`تم استيراد ${count} مجموعة بنجاح`, 'success');
}

// ==================== إدارة الأعضاء ====================

/**
 * إضافة عضو جديد
 * @param {string} name - اسم العضو
 * @param {Array} teams - الفرق التي ينتمي إليها
 * @param {Array} boxes - الصناديق المشترك فيها
 * @param {string} phone - رقم الهاتف
 * @param {string} birthDate - تاريخ الميلاد
 * @param {string} financialStatus - الحالة المادية
 * @param {string} jobStatus - الحالة الوظيفية
 * @returns {object} العضو المضاف
 */
function addMember(name, teams, boxes, phone, birthDate, financialStatus, jobStatus) {
    const members = getFromStorage('members', []);
    const newMember = {
        id: Date.now(),
        name: name,
        groups: [],
        boxes: boxes || [],
        phone: phone,
        birthDate: birthDate,
        financialStatus: financialStatus,
        jobStatus: jobStatus,
        teams: teams || [],
        joinDate: toISODateString(new Date()),
        paymentHistory: []
    };
    members.push(newMember);
    saveToStorage('members', members);
    showAlert('تم إضافة العضو بنجاح', 'success');
    return newMember;
}

/**
 * الحصول على جميع الأعضاء
 * @returns {Array} قائمة الأعضاء
 */
function getAllMembers() {
    return getFromStorage('members', []);
}

/**
 * حذف عضو
 * @param {number} memberId - معرف العضو
 */
function deleteMember(memberId) {
    const members = getFromStorage('members', []);
    const filtered = members.filter(m => m.id !== memberId);
    saveToStorage('members', filtered);
    showAlert('تم حذف العضو بنجاح', 'success');
}

/**
 * تحديث بيانات عضو
 * @param {number} memberId - معرف العضو
 * @param {object} updatedData - البيانات المحدثة
 */
function updateMember(memberId, updatedData) {
    const members = getFromStorage('members', []);
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
        members[index] = { ...members[index], ...updatedData };
        saveToStorage('members', members);
        showAlert('تم تحديث بيانات العضو بنجاح', 'success');
    }
}

/**
 * تحرير عضو (قيد التطوير)
 * @param {number} memberId - معرف العضو
 */
function editMember(memberId) {
    showAlert('سيتم تطوير هذه الميزة قريباً', 'info');
}

// ==================== حساب حالات الدفع ====================

/**
 * حساب حالة الدفع لعضو في صندوق معين
 * @param {number} memberId - معرف العضو
 * @param {number} boxId - معرف الصندوق
 * @returns {string} حالة الدفع (completed, delayed, unpaid, pending, unknown)
 */
function calculatePaymentStatus(memberId, boxId) {
    const members = getFromStorage('members', []);
    const boxes = getFromStorage('boxes', []);

    const member = members.find(m => m.id === memberId);
    const box = boxes.find(b => b.id === boxId);

    if (!member || !box) return 'unknown';

    const today = new Date();
    const dueDate = new Date(box.nextDueDate);

    const lastPayment = member.paymentHistory?.find(p => p.boxId === boxId);

    if (!lastPayment) {
        return today > dueDate ? 'unpaid' : 'pending';
    }

    const paymentDate = new Date(lastPayment.date);

    if (paymentDate >= dueDate) {
        return 'completed';
    } else if (today > dueDate) {
        return 'delayed';
    } else {
        return 'pending';
    }
}

/**
 * الحصول على حالات الدفع لجميع صناديق العضو
 * @param {number} memberId - معرف العضو
 * @returns {object} كائن يحتوي على حالة الدفع لكل صندوق
 */
function getMemberPaymentStatus(memberId) {
    const members = getFromStorage('members', []);
    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const statuses = {};
    member.boxes.forEach(boxId => {
        statuses[boxId] = calculatePaymentStatus(memberId, boxId);
    });

    return statuses;
}

/**
 * الحصول على تسمية حالة الدفع بالعربية
 * @param {string} status - حالة الدفع
 * @returns {string} التسمية بالعربية
 */
function getStatusLabel(status) {
    const labels = {
        completed: 'مكتمل',
        delayed: 'متأخر',
        unpaid: 'لم يدفع',
        pending: 'قيد الانتظار'
    };
    return labels[status] || 'غير معروف';
}

/**
 * الحصول على تسمية الحالة المادية بالعربية
 * @param {string} status - الحالة المادية
 * @returns {string} التسمية بالعربية
 */
function getFinancialStatusLabel(status) {
    const labels = {
        affluent: 'ميسور',
        moderate: 'متوسط',
        difficult: 'معسر'
    };
    return labels[status] || status;
}

/**
 * الحصول على تسمية الحالة الوظيفية بالعربية
 * @param {string} status - الحالة الوظيفية
 * @returns {string} التسمية بالعربية
 */
function getJobStatusLabel(status) {
    const labels = {
        employed: 'موظف',
        unemployed: 'عاطل',
        retired: 'متقاعد'
    };
    return labels[status] || status;
}

/**
 * حساب العمر من تاريخ الميلاد
 * @param {string} birthDateString - تاريخ الميلاد بصيغة string
 * @returns {number|string} العمر أو نص بديل
 */
function calculateAge(birthDateString) {
    if (!birthDateString) return 'غير محدد';

    const birthDate = new Date(birthDateString);
    if (isNaN(birthDate.getTime())) return 'تاريخ غير صالح';

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();

    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}


// ==================== رسائل WhatsApp ====================

/**
 * توليد رسالة واتساب بناءً على حالة الدفع
 * @param {string} memberName - اسم العضو
 * @param {string} boxName - اسم الصندوق
 * @param {string} paymentStatus - حالة الدفع
 * @returns {string} نص الرسالة
 */
function generateWhatsAppMessage(memberName, boxName, paymentStatus) {
    const messages = {
        completed: `السلام عليكم ${memberName}، شكراً لك على دفع اشتراكك في صندوق ${boxName}. تم استلام المبلغ بنجاح.`,
        delayed: `السلام عليكم ${memberName}، نود تذكيرك بأن اشتراكك في صندوق ${boxName} متأخر عن موعده. يرجى التسديد في أقرب وقت.`,

        unpaid: `السلام عليكم ${memberName}، يرجى تسديد اشتراكك في صندوق ${boxName} في أقرب وقت ممكن.`
    };

    return messages[paymentStatus] || messages['unpaid'];
}

/**
 * تنظيف وتنسيق رقم الهاتف للاستخدام مع واتساب
 * @param {string} phone - رقم الهاتف
 * @returns {string} رقم الهاتف المنسق
 */
function cleanAndFormatPhone(phone) {
    // إزالة جميع الأحرف غير الرقمية
    let cleaned = phone.replace(/\D/g, '');

    // إذا كان الرقم يبدأ بالصفر المحلي (مثلاً 05) وكان أطول من 9 أرقام
    if (cleaned.startsWith('05') && cleaned.length >= 9) {
        // إزالة الصفر البادئ وإضافة رمز الدولة (966)
        cleaned = cleaned.substring(1);
        return `966${cleaned}`;
    }

    // إذا لم يبدأ بـ 0، نستخدمه كما هو
    return cleaned;
}

/**
 * إرسال رسالة واتساب
 * @param {string} phone - رقم الهاتف
 * @param {string} message - نص الرسالة
 */
function sendWhatsAppMessage(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

/**
 * إرسال رسالة واتساب لعضو بخصوص صندوق معين
 * @param {number} memberId - معرف العضو
 * @param {number} boxId - معرف الصندوق
 */
function sendMemberWhatsApp(memberId, boxId) {
    const members = getFromStorage('members', []);
    const boxes = getFromStorage('boxes', []);

    const member = members.find(m => m.id === memberId);
    const box = boxes.find(b => b.id === boxId);

    if (!member || !box) return;

    const status = calculatePaymentStatus(memberId, boxId);
    const message = generateWhatsAppMessage(member.name, box.name, status);
    const formattedPhone = cleanAndFormatPhone(member.phone);

    sendWhatsAppMessage(formattedPhone, message);
}

// ==================== دوال مساعدة للتنسيق ====================

/**
 * تنسيق الأرقام للعرض
 * @param {number} num - الرقم المراد تنسيقه
 * @returns {string} الرقم المنسق
 */
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return Math.round(parseFloat(num)).toString();
}

// ==================== واجهة المستخدم - التنبيهات والنوافذ المنبثقة ====================

/**
 * عرض رسالة تنبيه
 * @param {string} message - نص الرسالة
 * @param {string} type - نوع الرسالة (success, error, info)
 */
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert ${type}`;

    const icon = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };

    alertDiv.innerHTML = `<i class="fas fa-${icon[type]}"></i><span>${message}</span>`;

    const container = document.querySelector('.container') || document.body;
    container.insertBefore(alertDiv, container.firstChild);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

/**
 * فتح نافذة منبثقة
 * @param {string} modalId - معرف النافذة المنبثقة
 */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

/**
 * إغلاق نافذة منبثقة
 * @param {string} modalId - معرف النافذة المنبثقة
 */
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

/**
 * تبديل حالة القائمة المنسدلة للعضو
 * @param {HTMLElement} element - عنصر الرأس الذي تم النقر عليه
 */
function toggleMemberDropdown(element) {
    const parentDropdown = element.closest('.member-dropdown');
    const body = element.nextElementSibling;

    // إغلاق جميع القوائم المنسدلة الأخرى
    document.querySelectorAll('.member-dropdown').forEach(dropdown => {
        if (dropdown !== parentDropdown) {
            const otherHeader = dropdown.querySelector('.member-dropdown-header');
            const otherBody = dropdown.querySelector('.member-dropdown-body');

            if (otherHeader && otherHeader.classList.contains('active')) {
                otherHeader.classList.remove('active');
                otherBody.classList.remove('show');
            }
        }
    });

    // تبديل حالة القائمة المنسدلة الحالية
    element.classList.toggle('active');
    body.classList.toggle('show');
}

/**
 * تبديل حالة القسم القابل للطي
 * @param {HTMLElement} element - عنصر الرأس الذي تم النقر عليه
 */
function toggleCollapsible(element) {
    const content = element.nextElementSibling;
    element.classList.toggle('active');
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
    }
}

// ==================== عرض البيانات - الفرق ====================

/**
 * عرض بطاقات الفرق
 * @param {string} containerId - معرف الحاوية
 */
function renderTeamsTable(containerId) {
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (teams.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد فرق حالياً</p>';
        container.classList.remove('cards-grid');
        return;
    }

    container.classList.add('cards-grid');
    const members = getAllMembers();

    let html = '';

    teams.forEach(team => {
        const memberCount = members.filter(m => m.teams && m.teams.includes(team.id)).length;

        html += `
            <div class="card-item team-card">
                <div class="card-item-header">
                    <i class="fas fa-sitemap card-icon"></i>
                    <h4 class="card-item-title">${team.name}</h4>
                </div>
                <div class="card-item-body">
                    <div class="card-detail">
                        <span class="card-detail-label">عدد الأعضاء:</span>
                        <span class="card-detail-value">${memberCount}</span>
                    </div>
                </div>
                <div class="card-item-actions">
                    <button class="btn sm primary" onclick="openEditTeamModal(${team.id})" title="تحرير"><i class="fas fa-edit"></i> تحرير</button>
                    <button class="btn sm error" onclick="deleteTeam(${team.id}); renderTeamsTable('teams-table-container');" title="حذف"><i class="fas fa-trash"></i> حذف</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== عرض البيانات - الصناديق ====================

/**
 * حساب الرصيد الحالي للصندوق (الإيداعات - السحوبات)
 * @param {number} boxId - معرف الصندوق
 * @returns {number} الرصيد الحالي
 */
function calculateBoxBalance(boxId) {
    const deposits = getFromStorage('deposits', []);
    const withdrawals = getFromStorage('withdrawals', []);

    const totalDeposits = deposits
        .filter(d => d.boxId === boxId)
        .reduce((sum, d) => sum + parseFloat(d.amount), 0);

    const totalWithdrawals = withdrawals
        .filter(w => w.boxId === boxId)
        .reduce((sum, w) => sum + parseFloat(w.amount), 0);

    return totalDeposits - totalWithdrawals;
}

/**
 * عرض بطاقات الصناديق
 * @param {string} containerId - معرف الحاوية
 */
function renderBoxesTable(containerId) {
    const boxes = getAllBoxes();
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (boxes.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد صناديق حالياً</p>';
        container.classList.remove('cards-grid');
        return;
    }

    container.classList.add('cards-grid');

    let html = '';

    boxes.forEach(box => {
        const collectedAmount = calculateBoxCollectedAmount(box.id);
        const potentialAmount = calculateBoxPotentialAmount(box.id);
        const currentBalance = calculateBoxBalance(box.id); // حساب الرصيد الحقيقي

        // تحضير أسماء الفرق المشاركة
        let participatingTeams = 'لا توجد فرق مشاركة';
        if (box.teams && box.teams.length > 0) {
            const teamNames = box.teams.map(teamId => {
                const team = teams.find(t => t.id === teamId);
                return team ? team.name : '';
            }).filter(name => name !== '');

            if (teamNames.length > 0) {
                participatingTeams = teamNames.join('، ');
            }
        }

        html += `
            <div class="card-item">
                <div class="card-item-header">
                    <i class="fas fa-box-open card-icon"></i>
                    <h3 class="card-item-title">${box.name}</h3>
                </div>
                <div class="card-item-body">
                    <div class="card-detail">
                        <span class="card-detail-label">مبلغ الدفعة</span>
                        <span class="card-detail-value">${formatNumber(box.amount)}</span>
                    </div>
                    <div class="card-detail">
                        <span class="card-detail-label">التكرار</span>
                        <span class="card-detail-value">${getFrequencyLabel(box.frequency)}</span>
                    </div>
                    <div class="card-detail">
                        <span class="card-detail-label">تاريخ الاستحقاق</span>
                        <span class="card-detail-value">${box.nextDueDate ? toLocaleDateStringAR(box.nextDueDate) : 'غير محدد'}</span>
                    </div>
                    
                    <div class="collapsible-section">
                        <div class="collapsible-header" onclick="toggleCollapsible(this)">
                            <span>التفاصيل</span>
                            <i class="fas fa-chevron-down"></i>
                        </div>
                        <div class="collapsible-content">
                            <p><strong>المبلغ المتوقع (دورة):</strong> ${formatNumber(potentialAmount)}</p>
                            <p><strong>إجمالي المحصل:</strong> ${formatNumber(collectedAmount)}</p>
                            
                            <!-- الرصيد الحالي بتنسيق مميز -->
                            <p style="color: #27ae60; font-weight: 700; font-size: 14px; margin-top: 10px; margin-bottom: 10px; text-align: center;">
                                الرصيد الحالي: ${formatNumber(currentBalance)}
                            </p>

                            <p><strong>الفرق المشاركة:</strong></p>
                            <p>${participatingTeams}</p>
                        </div>
                    </div>
                </div>
                <div class="card-item-actions">
                    <button class="btn sm primary" onclick="openEditBoxModal(${box.id})" title="تحرير"><i class="fas fa-edit"></i> تحرير</button>
                    <button class="btn sm error" onclick="deleteBox(${box.id}); renderBoxesTable('boxes-table-container');" title="حذف"><i class="fas fa-trash"></i> حذف</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== عرض البيانات - الأعضاء ====================

/**
 * عرض القوائم المنسدلة للأعضاء
 * @param {string} containerId - معرف الحاوية
 * @param {Array} membersArray - قائمة الأعضاء (اختياري)
 */
function renderMembersDropdowns(containerId, membersArray = null) {
    const members = membersArray || getAllMembers();
    const boxes = getAllBoxes();
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (members.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد أعضاء حالياً</p>';
        return;
    }

    let html = '';

    members.forEach(member => {
        const paymentStatuses = getMemberPaymentStatus(member.id);

        let paymentStatusHtml = '';

        const allStatuses = Object.values(paymentStatuses);
        let overallStatus = 'completed';

        if (allStatuses.some(s => s === 'delayed')) {
            overallStatus = 'delayed';
        } else if (allStatuses.some(s => s === 'unpaid')) {
            overallStatus = 'unpaid';
        } else if (allStatuses.some(s => s === 'pending')) {
            overallStatus = 'pending';
        }

        const overallStatusClass = overallStatus === 'completed' ? 'completed' :
            overallStatus === 'delayed' ? 'delayed' :
                overallStatus === 'unpaid' ? 'unpaid' : 'pending';

        member.boxes.forEach(boxId => {
            const box = boxes.find(b => b.id === boxId);
            const status = paymentStatuses[boxId];
            const statusClass = status === 'completed' ? 'completed' :
                status === 'delayed' ? 'delayed' :
                    status === 'unpaid' ? 'unpaid' : 'pending';

            if (box) {
                paymentStatusHtml += `
                    <div class="member-info-item">
                        <div class="member-info-label">${box.name}</div>
                        <div class="flex-between">
                            <span class="payment-status ${statusClass}">${getStatusLabel(status)}</span>
                            <button class="btn sm" onclick="sendMemberWhatsApp(${member.id}, ${box.id})"><i class="fab fa-whatsapp"></i></button>
                        </div>
                    </div>
                `;
            }
        });

        html += `
            <div class="member-dropdown">
                <div class="member-dropdown-header" onclick="toggleMemberDropdown(this)">
                    <div class="flex-between" style="flex-grow: 1; margin-left: 15px;">
                        <strong>${member.name}</strong>
                        <span class="payment-status ${overallStatusClass}">${getStatusLabel(overallStatus)}</span>
                    </div>
                    <i class="fas fa-chevron-down"></i>
                </div>
                <div class="member-dropdown-body">
                    <div class="member-info">
                        <div class="member-info-item">
                            <div class="member-info-label">الفرق</div>
                            <div class="member-info-value">${member.teams && member.teams.length > 0 ? member.teams.map(teamId => { const team = teams.find(t => t.id === teamId); return team ? team.name : 'غير معروف'; }).join(', ') : 'لم يتم تحديد'}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">الهاتف</div>
                            <div class="member-info-value">${member.phone}</div>
                        </div>
                        ${member.birthDate ? `
                        <div class="member-info-item">
                            <div class="member-info-label">العمر</div>
                            <div class="member-info-value">${calculateAge(member.birthDate)}</div>
                        </div>` : ''}
                        ${member.financialStatus ? `
                        <div class="member-info-item">
                            <div class="member-info-label">الحالة المادية</div>
                            <div class="member-info-value">${getFinancialStatusLabel(member.financialStatus)}</div>
                        </div>` : ''}
                        ${member.jobStatus ? `
                        <div class="member-info-item">
                            <div class="member-info-label">الحالة الوظيفية</div>
                            <div class="member-info-value">${getJobStatusLabel(member.jobStatus)}</div>
                        </div>` : ''}
                        <div class="member-info-item">
                            <div class="member-info-label">تاريخ الانضمام</div>
                            <div class="member-info-value">${toLocaleDateStringAR(member.joinDate)}</div>
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px;">
                        <div class="member-info-label" style="margin-bottom: 10px;">حالة الدفع</div>
                        <div class="member-info" style="grid-template-columns: 1fr;">
                            ${paymentStatusHtml}
                        </div>
                    </div>
                    <div style="border-top: 1px solid var(--border-color); padding-top: 15px; margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn sm" onclick="editMember(${member.id})"><i class="fas fa-edit"></i> تحرير</button>
                        <button class="btn sm" onclick="deleteMember(${member.id}); renderMembersDropdowns('members-dropdowns-container');"><i class="fas fa-trash"></i> حذف</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// ==================== عرض Checkboxes ====================

/**
 * عرض checkboxes المجموعات
 * @param {string} containerId - معرف الحاوية
 */
function renderGroupsCheckboxes(containerId) {
    const groups = getAllGroups();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (groups.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); font-size: 12px;">لا توجد مجموعات. استخدم "استيراد مجموعات" أولاً</p>';
        return;
    }

    let html = '<div class="checkbox-group">';
    groups.forEach(group => {
        const uniqueId = `group-${group.id}-${containerId}`;
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="${uniqueId}" value="${group.id}" name="groups">
                <label for="${uniqueId}">${group.name}</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

/**
 * عرض checkboxes الصناديق
 * @param {string} containerId - معرف الحاوية
 */
function renderBoxesCheckboxes(containerId) {
    const boxes = getAllBoxes();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (boxes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); font-size: 12px;">لا توجد صناديق. أضف صندوق أولاً</p>';
        return;
    }

    let html = '<div class="checkbox-group">';
    boxes.forEach(box => {
        const uniqueId = `box-${box.id}-${containerId}`;
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="${uniqueId}" value="${box.id}" name="boxes">
                <label for="${uniqueId}">${box.name} (${formatNumber(box.amount)})</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

/**
 * عرض checkboxes الفرق
 * @param {string} containerId - معرف الحاوية
 */
function renderTeamsCheckboxes(containerId) {
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (teams.length === 0) {
        container.innerHTML = '<p style="color: var(--text-light); font-size: 12px;">لا توجد فرق. أضف فريق أولاً</p>';
        return;
    }

    let html = '<div class="checkbox-group">';
    teams.forEach(team => {
        const uniqueId = `team-${team.id}-${containerId}`;
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="${uniqueId}" value="${team.id}" name="teams">
                <label for="${uniqueId}">${team.name}</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// ==================== التصفية ====================

/**
 * تطبيق التصفية على الأعضاء
 */
function applyMemberFilters() {
    const selectedTeamId = document.getElementById('filterByTeam').value;
    const selectedBoxId = document.getElementById('filterByBox').value;
    const selectedStatus = document.getElementById('filterByStatus').value;

    const allMembers = getAllMembers();

    const filteredMembers = allMembers.filter(member => {
        // تصفية حسب الفريق
        if (selectedTeamId && (!member.teams || !member.teams.includes(parseInt(selectedTeamId)))) {
            return false;
        }

        // تصفية حسب الصندوق
        if (selectedBoxId && (!member.boxes || !member.boxes.includes(parseInt(selectedBoxId)))) {
            return false;
        }

        // تصفية حسب حالة الدفع
        if (selectedStatus) {
            const memberStatuses = getMemberPaymentStatus(member.id);

            if (selectedBoxId) {
                // إذا تم تحديد صندوق: نتحقق من حالة الدفع للصندوق المحدد فقط
                if (memberStatuses && memberStatuses[parseInt(selectedBoxId)] !== selectedStatus) {
                    return false;
                }
            } else {
                // إذا لم يتم تحديد صندوق: نتحقق مما إذا كانت أي حالة دفع مطابقة
                const statusMatches = Object.values(memberStatuses || {}).some(status => status === selectedStatus);
                if (!statusMatches) {
                    return false;
                }
            }
        }

        return true;
    });

    renderMembersDropdowns('members-dropdowns-container', filteredMembers);
}

/**
 * ملء خيارات التصفية
 */
function populateMemberFilters() {
    const teams = getAllTeams();
    const boxes = getAllBoxes();

    const teamSelect = document.getElementById('filterByTeam');
    const boxSelect = document.getElementById('filterByBox');
    const statusSelect = document.getElementById('filterByStatus');

    if (!teamSelect || !boxSelect || !statusSelect) return;

    // ملء تصفية الفرق
    teamSelect.innerHTML = '<option value="">الفريق</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });

    // ملء تصفية الصناديق
    boxSelect.innerHTML = '<option value="">الصندوق</option>';
    boxes.forEach(box => {
        const option = document.createElement('option');
        option.value = box.id;
        option.textContent = box.name;
        boxSelect.appendChild(option);
    });

    // إضافة مستمعي الأحداث
    teamSelect.addEventListener('change', applyMemberFilters);
    boxSelect.addEventListener('change', applyMemberFilters);
    statusSelect.addEventListener('change', applyMemberFilters);
}

// ==================== مستمعي الأحداث العامة ====================

// إغلاق النوافذ المنبثقة عند النقر خارجها
document.addEventListener('click', function (event) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// إغلاق النوافذ بزر الإغلاق
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('modal-close')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
});

// ==================== التهيئة ====================

document.addEventListener('DOMContentLoaded', function () {
    initializeData();

    // ملء خيارات التصفية
    if (typeof populateMemberFilters === 'function') {
        populateMemberFilters();
    }

    // تحديث التاريخ
    const dateDisplay = document.querySelector('.date-display');

    // التحقق من وجود العناصر في الصفحة الرئيسية قبل تحديث التاريخ
    if (dateDisplay) {
        const today = new Date();
        const dayName = new Intl.DateTimeFormat('ar-SA', { weekday: 'long' }).format(today);
        const hijriDate = formatHijriDate(today);
        const gregorianDate = formatGregorianDate(today);

        // 3. دمج اليوم والتاريخ الهجري والميلادي
        dateDisplay.textContent = `${dayName} | ${hijriDate} | ${gregorianDate}`;
    }

    // تحديث الروابط النشطة في القائمة
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('nav a').forEach(link => {
        if (link.getAttribute('href') === currentPage ||
            (currentPage === '' && link.getAttribute('href') === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// ==================== عرض البيانات - لوحة التحكم ====================

/**
 * عرض أرصدة الصناديق في لوحة التحكم
 * @param {string} containerId - معرف الحاوية
 */
function renderDashboardBoxBalances(containerId) {
    const boxes = getAllBoxes();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (boxes.length === 0) {
        container.innerHTML = '<p class="text-center" style="grid-column: 1/-1; color: var(--text-muted);">لا توجد صناديق حالياً</p>';
        return;
    }

    let html = '';

    boxes.forEach(box => {
        const currentBalance = calculateBoxBalance(box.id);

        // تحديد لون الرصيد (أخضر للموجب، أحمر للسالب)
        const balanceColor = currentBalance >= 0 ? '#27ae60' : '#e74c3c';

        html += `
            <div class="dashboard-box-card">
                <div class="dashboard-box-icon">
                    <i class="fas fa-box"></i>
                </div>
                <div class="dashboard-box-info">
                    <h4 class="dashboard-box-title">${box.name}</h4>
                    <div class="dashboard-box-balance" style="color: ${balanceColor}">
                        ${formatNumber(currentBalance)} <span class="currency">ريال</span>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
