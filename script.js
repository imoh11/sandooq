/**
 * دالة لإظهار رسالة تنبيه منبثقة في وسط الشاشة.
 * @param {string} message - نص الرسالة المطلوب عرضها.
 * @param {string} type - نوع الرسالة ('success', 'error', أو 'info').
 * @param {number} duration - مدة ظهور الرسالة بالمللي ثانية (افتراضي: 4000).
 */
function showAlert(message, type = 'success', duration = 4000) {
  // البحث عن حاوية الرسائل، وإذا لم تكن موجودة، يتم إنشاؤها.
  let alertContainer = document.querySelector('.alert-container');
  if (!alertContainer) {
    alertContainer = document.createElement('div');
    alertContainer.className = 'alert-container';
    document.body.appendChild(alertContainer);
  }

  // إنشاء عنصر الرسالة الجديد
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`; // مثل: "alert success"

  // تحديد الأيقونة المناسبة لنوع الرسالة
  const icon = document.createElement('i');
  let iconClass = 'fas fa-check-circle'; // افتراضي للنجاح
  if (type === 'error') {
    iconClass = 'fas fa-times-circle';
  } else if (type === 'info') {
    iconClass = 'fas fa-info-circle';
  }
  icon.className = iconClass;

  // إضافة الأيقونة والنص إلى الرسالة
  alertDiv.appendChild(icon);
  alertDiv.appendChild(document.createTextNode(` ${message}`));

  // إضافة الرسالة إلى الحاوية
  alertContainer.appendChild(alertDiv);

  // إزالة الرسالة تلقائيًا بعد فترة زمنية
  setTimeout(() => {
    // بدء تأثير التلاشي
    alertDiv.style.opacity = '0';
    // انتظار انتهاء التأثير ثم إزالة العنصر من DOM
    setTimeout(() => alertDiv.remove(), 400);
  }, duration);
}
