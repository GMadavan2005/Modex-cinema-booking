import path from "path";
import app from "./app";
import express from "express";

const PORT = process.env.PORT || 8080;

const frontendPath = path.join(__dirname, "../../dist");

app.use(express.static(frontendPath));

app.get("*", (_req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
