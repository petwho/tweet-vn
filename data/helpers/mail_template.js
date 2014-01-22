exports.activation = {
  "html": "<p>Chào {{username}}.</p><p>Cảm ơn bạn đã đăng ký tài khoản trên  {{url}}</p><p>Vui lòng click đường link sau để kích hoạt tài khoản <a href='{{activate_link}}'>activate</a></p>",
  "text": "Chào {{username}}. Cảm ơn bạn đã đăng ký tài khoản trên  {{url}}. Vui lòng click đường link sau để kích hoạt tài khoản {{activate_link}}",
  "subject": "Kích hoạt tài khoản",
  "from_email": process.env.NOTIFIER_EMAIL_ADD,
  "from_name": process.env.NOTIFIER_NAME
};

exports.resetPwd = {
  "html": "<p>Chào {{username}}.</p><p>Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn trên {{url}}. Để đổi mật khẩu vui lòng click đường link sau: <a href='{{reset_password_link}}'>reset</a></p>",
  "text": "Chào {{username}}. Chúng tôi nhận được yêu cầu thay đổi mật khẩu cho tài khoản của bạn trên {{url}}. Để đổi mật khẩu vui lòng click đường link sau: {{reset_password_link}}",
  "subject": "Thay đổi mật khẩu",
  "from_email": process.env.NOTIFIER_EMAIL_ADD,
  "from_name": process.env.NOTIFIER_NAME
};
