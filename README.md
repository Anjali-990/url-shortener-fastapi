# 🔗 URL Shortener API

## 🚀 Features

- Shorten long URLs
- Custom short links
- Click tracking
- Analytics API
- Expiry links

## 🛠 Tech Stack

- FastAPI
- MongoDB
- Python

## 📌 API Endpoints

### POST /shorten

Create short URL

### GET /{short_code}

Redirect to original URL

### GET /analytics/{short_code}

Get click analytics

## ▶️ Run Locally

```bash
uvicorn app.main:app --reload --port 8001
```


