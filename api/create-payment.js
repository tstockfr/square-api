module.exports = async (req, res) => {
  res.status(200).json({
    success: true,
    message: "API Vercel opérationnelle"
  });
};
