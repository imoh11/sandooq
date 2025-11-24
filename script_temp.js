
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
