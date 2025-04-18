export const sendToken = (user, statusCode, message, res) => {
  const token = user.generateToken();

  const cookieOptions = {
    expires: new Date(Date.now() + Number(process.env.COOKIE_EXPIRE) * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie('token', token, cookieOptions).json({
    success: true,
    user,
    message,
    token,
  });
};
