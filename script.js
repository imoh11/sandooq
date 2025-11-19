// ==================== التحويل بين التواريخ ====================

// تحويل التاريخ الميلادي إلى هجري
function convertToHijri(date) {
    const d = new Date(date);
    const jd = Math.floor((d / 86400000) - (d.getTimezoneOffset() / 1440) + 2440587.5);
    let l, n, j;
    l = jd + 68569;
    n = Math.floor((4 * l) / 146097);
    l = l - Math.floor((146097 * n + 3) / 4);
    const i = Math.floor((4000 * (l + 1)) / 1461001);
    l = l - Math.floor((1461 * i) / 4) + 31;
    const j2 = Math.floor((80 * l) / 2447);
    const day = l - Math.floor((2447 * j2) / 80);
    l = Math.floor(j2 / 11);
    const month = j2 + 2 - (12 * l);
    const year = (100 * (n - 49)) + i + l;
    return { year, month, day };
}

// تنسيق التاريخ الهجري
function formatHijriDate(date) {
    const hijri = convertToHijri(date);
    const monthsHijri = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة',
        'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
    return `${hijri.day} ${monthsHijri[hijri.month - 1]} ${hijri.year}`;
}

// تنسيق التاريخ الميلادي
function formatGregorianDate(date) {
    return new Date(date).toLocaleDateString('ar-SA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// ==================== التخزين المحلي ====================

function getFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('خطأ في قراءة التخزين:', e);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('خطأ في حفظ البيانات:', e);
        return false;
    }
}

function removeFromStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('خطأ في حذف البيانات:', e);
        return false;
    }
}

// ==================== البيانات الأولية ====================

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

// ==================== إدارة الفرق ====================

function addTeam(name) {
    const teams = getFromStorage('teams', []);
    const newTeam = {
        id: Date.now(),
        name: name,
        createdDate: new Date().toLocaleDateString('ar-SA'),
        members: []
    };
    teams.push(newTeam);
    saveToStorage('teams', teams);
    showAlert('تم إضافة الفريق بنجاح', 'success');
    return newTeam;
}

function getAllTeams() {
    return getFromStorage('teams', []);
}

function deleteTeam(teamId) {
    const teams = getFromStorage('teams', []);
    const filtered = teams.filter(t => t.id !== teamId);
    saveToStorage('teams', filtered);
    showAlert('تم حذف الفريق بنجاح', 'success');
}

// ==================== إدارة الصناديق ====================

function addBox(name, amount, teams, frequency) {
    const boxes = getFromStorage('boxes', []);
    const newBox = {
        id: Date.now(),
        name: name,
        amount: parseFloat(amount),
        teams: teams,
        frequency: frequency,
        nextDueDate: calculateNextDueDate(frequency),
        createdDate: new Date().toLocaleDateString('ar-SA')
    };
    boxes.push(newBox);
    saveToStorage('boxes', boxes);
    showAlert('تم إضافة الصندوق بنجاح', 'success');
    return newBox;
}

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

    return nextDate.toLocaleDateString('ar-SA');
}

function getFrequencyLabel(frequency) {
    const labels = {
        'monthly': 'شهري',
        'quarterly': 'ربع سنوي',
        'annual': 'سنوي'
    };
    return labels[frequency] || frequency;
}

function getAllBoxes() {
    return getFromStorage('boxes', []);
}

function deleteBox(boxId) {
    const boxes = getFromStorage('boxes', []);
    const filtered = boxes.filter(b => b.id !== boxId);
    saveToStorage('boxes', filtered);
    showAlert('تم حذف الصندوق بنجاح', 'success');
}

function updateBoxDueDate(boxId, newDate) {
    const boxes = getFromStorage('boxes', []);
    const box = boxes.find(b => b.id === boxId);
    if (box) {
        box.nextDueDate = newDate;
        saveToStorage('boxes', boxes);
    }
}

// ⭐️ تم التعديل: إضافة دالة مركزية لتحديث الصندوق
function updateBox(boxId, updatedData) {
    const boxes = getFromStorage('boxes', []);
    const index = boxes.findIndex(b => b.id === boxId);

    if (index !== -1) {
        // دمج البيانات القديمة مع الجديدة
        boxes[index] = { ...boxes[index], ...updatedData };

        // إعادة حساب تاريخ الاستحقاق التالي دائماً عند أي تعديل لضمان صحته
        boxes[index].nextDueDate = calculateNextDueDate(boxes[index].frequency);

        saveToStorage('boxes', boxes);
        showAlert('تم تحديث الصندوق بنجاح', 'success');
        return true;
    }
    return false;
}
// ==================== إدارة المجموعات ====================

function addGroup(name) {
    const groups = getFromStorage('groups', []);
    const newGroup = {
        id: Date.now(),
        name: name,
        createdDate: new Date().toLocaleDateString('ar-SA')
    };
    groups.push(newGroup);
    saveToStorage('groups', groups);
    return newGroup;
}

function getAllGroups() {
    return getFromStorage('groups', []);
}

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

// الكود المُصحَّح (تم إضافة 'teams')
// ✅ الكود المُعدل والمُقترح في script.js
function addMember(name, teams, boxes, phone, birthDate, financialStatus, jobStatus) {
    const members = getFromStorage('members', []);
    const newMember = {
        id: Date.now(),
        name: name,
        groups: [], // بما أنها لم تعد تُستخدم، يمكن تركها فارغة
        boxes: boxes || [],
        phone: phone,
        birthDate: birthDate,
        financialStatus: financialStatus,
        jobStatus: jobStatus,
        teams: teams || [], // الآن ستأخذ القيمة الصحيحة
        joinDate: new Date().toLocaleDateString('ar-SA'),
        paymentHistory: []
    };
    members.push(newMember);
    saveToStorage('members', members);
    showAlert('تم إضافة العضو بنجاح', 'success');
    return newMember;
}
function getAllMembers() {
    return getFromStorage('members', []);
}

function deleteMember(memberId) {
    const members = getFromStorage('members', []);
    const filtered = members.filter(m => m.id !== memberId);
    saveToStorage('members', filtered);
    showAlert('تم حذف العضو بنجاح', 'success');
}

function updateMember(memberId, updatedData) {
    const members = getFromStorage('members', []);
    const index = members.findIndex(m => m.id === memberId);
    if (index !== -1) {
        members[index] = { ...members[index], ...updatedData };
        saveToStorage('members', members);
        showAlert('تم تحديث بيانات العضو بنجاح', 'success');
    }
}

// ==================== حساب حالات الدفع ====================

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

function getMemberPaymentStatus(memberId) {
    const members = getFromStorage('members', []);
    const boxes = getFromStorage('boxes', []);

    const member = members.find(m => m.id === memberId);
    if (!member) return null;

    const statuses = {};
    member.boxes.forEach(boxId => {
        statuses[boxId] = calculatePaymentStatus(memberId, boxId);
    });

    return statuses;
}

// ==================== رسائل WhatsApp ====================

function generateWhatsAppMessage(memberName, boxName, paymentStatus) {
    const messages = {
        completed: `السلام عليكم ${memberName}، شكراً لك على دفع اشتراكك في صندوق ${boxName}. تم استلام المبلغ بنجاح.`,
        delayed: `السلام عليكم ${memberName}، نود تذكيرك بأن اشتراكك في صندوق ${boxName} متأخر عن موعده. يرجى التسديد في أقرب وقت.`,
        unpaid: `السلام عليكم ${memberName}، يرجى تسديد اشتراكك في صندوق ${boxName} في أقرب وقت ممكن.`
    };

    return messages[paymentStatus] || messages['unpaid'];
}

function sendWhatsAppMessage(phone, message) {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
}

// ==================== واجهة المستخدم ====================

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

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
    }
}

// ==================== واجهة المستخدم (Toggle) ====================

function toggleMemberDropdown(element) {
    // 1. الحصول على العنصر الأب الحالي (العضو)
    const parentDropdown = element.closest('.member-dropdown');
    const body = element.nextElementSibling;

    // 2. إغلاق جميع القوائم المنسدلة الأخرى المفتوحة
    document.querySelectorAll('.member-dropdown').forEach(dropdown => {
        // التأكد من أننا لا نغلق القائمة التي تم النقر عليها حالياً
        if (dropdown !== parentDropdown) {
            const otherHeader = dropdown.querySelector('.member-dropdown-header');
            const otherBody = dropdown.querySelector('.member-dropdown-body');

            if (otherHeader && otherHeader.classList.contains('active')) {
                otherHeader.classList.remove('active');
                otherBody.classList.remove('show');
            }
        }
    });

    // 3. تبديل حالة القائمة المنسدلة التي تم النقر عليها
    element.classList.toggle('active');
    body.classList.toggle('show');
}
function editMember(memberId) {
  showAlert('سيتم تطوير هذه الميزة قريباً', 'info');
}

// ==================== عرض البيانات ====================

function renderTeamsTable(containerId) {
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (teams.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد فرق حالياً</p>';
        return;
    }

    // ⭐️ تم التعديل: جلب الأعضاء لحساب العدد
    const members = getAllMembers();

    // ⭐️ تم التعديل: تغيير عنوان العمود
    let html = '<table><thead><tr><th>اسم الفريق</th><th>عدد الأعضاء</th><th>الإجراءات</th></tr></thead><tbody>';

    teams.forEach(team => {
        // ⭐️ تم التعديل: حساب عدد الأعضاء في كل فريق
        const memberCount = members.filter(m => m.teams && m.teams.includes(team.id)).length;

        html += `
            <tr>
                <td>${team.name}</td>
                <td>${memberCount}</td>
                <td>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn sm" onclick="openEditTeamModal(${team.id})" title="تحرير"><i class="fas fa-edit"></i></button>
                        <button class="btn sm" onclick="deleteTeam(${team.id}); renderTeamsTable('teams-table-container');" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderBoxesTable(containerId) {
    const boxes = getAllBoxes();
    const teams = getAllTeams();
    const container = document.getElementById(containerId);

    if (!container) return;

    if (boxes.length === 0) {
        container.innerHTML = '<p class="text-center">لا توجد صناديق حالياً</p>';
        return;
    }

    // ⭐️ تم التعديل: تحديث عناوين الجدول
    let html = '<table><thead><tr><th>اسم الصندوق</th><th>المبلغ</th><th>عدد الفرق</th><th>الاستحقاق التالي</th><th>الإجراءات</th></tr></thead><tbody>';

    boxes.forEach(box => {
        // ⭐️ تم التعديل: حساب عدد الفرق وتجهيز أسماء الفرق للـ tooltip
        const teamCount = box.teams ? box.teams.length : 0;
        const teamsNamesTooltip = teamCount > 0
            ? box.teams.map(teamId => {
                const team = teams.find(t => t.id === teamId);
                return team ? team.name : 'غير معروف';
            }).join(', ')
            : 'لا توجد فرق مشاركة';

        html += `
            <tr>
                <td>${box.name}</td>
                <td>${formatNumber(box.amount)}</td>
                <td title="${teamsNamesTooltip}">${teamCount}</td>
                <td>${box.nextDueDate}</td>
                <td>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn sm" onclick="openEditBoxModal(${box.id})" title="تحرير"><i class="fas fa-edit"></i></button>
                        <button class="btn sm" onclick="deleteBox(${box.id}); renderBoxesTable('boxes-table-container');" title="حذف"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
}

function renderMembersDropdowns(containerId, membersArray = null) {
    // ⭐️ تم التعديل: لاستقبال قائمة أعضاء مصفاة
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
        let overallStatus = 'completed'; // الافتراضي هو مكتمل

        if (allStatuses.some(s => s === 'delayed')) {
            overallStatus = 'delayed';
        } else if (allStatuses.some(s => s === 'unpaid')) {
            overallStatus = 'unpaid';
        } else if (allStatuses.some(s => s === 'pending')) {
            overallStatus = 'pending';
        }

        const overallStatusClass = overallStatus === 'completed' ? 'completed' : overallStatus === 'delayed' ? 'delayed' : overallStatus === 'unpaid' ? 'unpaid' : 'pending';
        member.boxes.forEach(boxId => {
            const box = boxes.find(b => b.id === boxId);
            const status = paymentStatuses[boxId];
            const statusClass = status === 'completed' ? 'completed' : status === 'delayed' ? 'delayed' : status === 'unpaid' ? 'unpaid' : 'pending';

            if (box) {
                paymentStatusHtml += `
                    <div class="member-info-item">
                        <div class="member-info-label">${box.name}</div>
                        <div class="flex-between">
                            <span class="payment-status ${statusClass}">${getStatusLabel(status)}</span>
                            <button class="btn sm" onclick="sendMemberWhatsApp(${member.id}, ${boxId})"><i class="fab fa-whatsapp"></i></button>
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
                            <div class="member-info-value">${member.teams && member.teams.length > 0 ? member.teams.map(teamId => { const team = teams.find(t => t.id === teamId); return team ? team.name : 'غير معروف'; }).join(', ') : 'لم يتم تحديث'}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">الهاتف</div>
                            <div class="member-info-value">${member.phone}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">تاريخ الميلاد</div>
                            <div class="member-info-value">${member.birthDate || 'لم يتم تحديد'}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">الحالة المادية</div>
                            <div class="member-info-value">${getFinancialStatusLabel(member.financialStatus)}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">الحالة الوظيفية</div>
                            <div class="member-info-value">${getJobStatusLabel(member.jobStatus)}</div>
                        </div>
                        <div class="member-info-item">
                            <div class="member-info-label">تاريخ الانضمام</div>
                            <div class="member-info-value">${member.joinDate}</div>
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

function sendMemberWhatsApp(memberId, boxId) {
    const members = getFromStorage('members', []);
    const boxes = getFromStorage('boxes', []);

    const member = members.find(m => m.id === memberId);
    const box = boxes.find(b => b.id === boxId);

    if (!member || !box) return;

    const status = calculatePaymentStatus(memberId, boxId);
    const message = generateWhatsAppMessage(member.name, box.name, status);

    // يتم تنسيق الرقم هنا قبل الإرسال
    const formattedPhone = cleanAndFormatPhone(member.phone);

    sendWhatsAppMessage(formattedPhone, message);
}
function getStatusLabel(status) {
    const labels = {
        completed: 'مكتمل',
        delayed: 'متأخر',
        unpaid: 'لم يدفع',
        pending: 'قيد الانتظار'
    };
    return labels[status] || 'غير معروف';
}

function getFinancialStatusLabel(status) {
    const labels = {
        affluent: 'ميسور',
        moderate: 'متوسط',
        difficult: 'معسر'
    };
    return labels[status] || status;
}

function getJobStatusLabel(status) {
    const labels = {
        employed: 'موظف',
        unemployed: 'عاطل',
        retired: 'متقاعد'
    };
    return labels[status] || status;
}

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
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="group-${group.id}" value="${group.id}" name="groups">
                <label for="group-${group.id}">${group.name}</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

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
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="box-${box.id}" value="${box.id}" name="boxes">
                <label for="box-${box.id}">${box.name} (${formatNumber(box.amount)})</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

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
        html += `
            <div class="checkbox-item">
                <input type="checkbox" id="team-${team.id}" value="${team.id}" name="teams">
                <label for="team-${team.id}">${team.name}</label>
            </div>
        `;
    });
    html += '</div>';

    container.innerHTML = html;
}

// ==================== دوال تطبيق التصفية (الجديدة) ====================

function applyMemberFilters() {
    // 1. الحصول على قيم التصفية
    const selectedTeamId = document.getElementById('filterByTeam').value;
    const selectedBoxId = document.getElementById('filterByBox').value;
    const selectedStatus = document.getElementById('filterByStatus').value;

    const allMembers = getAllMembers();

    // 2. تطبيق منطق التصفية
    const filteredMembers = allMembers.filter(member => {

        // أ. تصفية حسب الفريق
        if (selectedTeamId && (!member.teams || !member.teams.includes(selectedTeamId))) {
            return false;
        }

        // ب. تصفية حسب الصندوق
        if (selectedBoxId && (!member.boxes || !member.boxes.includes(selectedBoxId))) {
            return false;
        }

        // ج. تصفية حسب حالة الدفع
        if (selectedStatus) {
            const memberStatuses = getMemberPaymentStatus(member.id);

            if (selectedBoxId) {
                // إذا تم تحديد صندوق: نتحقق من حالة الدفع للصندوق المحدد فقط
                if (memberStatuses && memberStatuses[selectedBoxId] !== selectedStatus) {
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

    // 3. عرض القوائم المنسدلة للأعضاء المصفّين
    renderMembersDropdowns('members-dropdowns-container', filteredMembers);
}


// ==================== دوال ملء فلاتر التصفية ====================

function populateMemberFilters() {
    const teams = getAllTeams();
    const boxes = getAllBoxes();

    const teamSelect = document.getElementById('filterByTeam');
    const boxSelect = document.getElementById('filterByBox');
    const statusSelect = document.getElementById('filterByStatus');

    if (!teamSelect || !boxSelect || !statusSelect) return;

    // 1. ملء تصفية الفرق
    teamSelect.innerHTML = '<option value="">الفريق</option>';
    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team.id;
        option.textContent = team.name;
        teamSelect.appendChild(option);
    });

    // 2. ملء تصفية الصناديق
    boxSelect.innerHTML = '<option value="">الصندوق</option>';
    boxes.forEach(box => {
        const option = document.createElement('option');
        option.value = box.id;
        option.textContent = box.name;
        boxSelect.appendChild(option);
    });

    // 3. إضافة مستمعي الأحداث
    teamSelect.addEventListener('change', applyMemberFilters);
    boxSelect.addEventListener('change', applyMemberFilters);
    statusSelect.addEventListener('change', applyMemberFilters);
}

// ==================== دوال مساعدة ====================

function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0.00';
    return parseFloat(num).toLocaleString('ar-SA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('ar-SA');
}

// ==================== دوال مساعدة لرقم الهاتف ====================

function cleanAndFormatPhone(phone) {
    // 1. إزالة جميع الأحرف غير الرقمية
    let cleaned = phone.replace(/\D/g, '');

    // 2. إذا كان الرقم يبدأ بالصفر المحلي (مثلاً 05) وكان أطول من 9 أرقام،
    // نفترض أنه رقم محلي ونضيف رمز الدولة (966 لافتراض المنطقة)
    if (cleaned.startsWith('05') && cleaned.length >= 9) {
        // إزالة الصفر البادئ
        cleaned = cleaned.substring(1);
        // إضافة رمز الدولة (افتراض 966)
        return `966${cleaned}`;
    }

    // 3. إذا لم تبدأ بـ 0، نستخدمها كما هي (افتراضاً أنها دولية أو صالحة)
    return cleaned;
}

// إغلاق النوافذ المنبثقة عند النقر خارجها
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
        }
    });
});

// إغلاق النوافذ بزر الإغلاق
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-close')) {
        const modal = event.target.closest('.modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }
});

// ==================== التهيئة ====================

document.addEventListener('DOMContentLoaded', function() {
    initializeData();

    // ⭐️ استدعاء الدالة الجديدة لملء خيارات التصفية
    if (typeof populateMemberFilters === 'function') {
        populateMemberFilters();
    }

    // تحديث التاريخ
    const dateDisplay = document.querySelector('.date-display');
    if (dateDisplay) {
        const today = new Date();
        dateDisplay.innerHTML = `
            <div class="date-hijri">${formatHijriDate(today)}</div>
            <div class="date-gregorian">${formatGregorianDate(today)}</div>
        `;
    }

    // تحديث الملاحات النشطة
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
