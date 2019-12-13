exports.checkAuth = req => {
  if (!req.isAuth) {
    throw new Error(
      "Sie müssen angemeldet sein, um diese Aktion durchzuführen"
    );
  }
};
