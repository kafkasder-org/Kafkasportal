# GitHub MCP Server - Hızlı Referans Kartı

## 🎯 En Sık Kullanılan Komutlar

### Issue Yönetimi

```bash
"Açık issue'ları listele"
"[Başlık] için issue aç"
"Issue #[numara]'ya Copilot ata"
"[Label] label'lı issue'ları bul"
```

### Pull Request

```bash
"Açık PR'ları göster"
"[Branch]'den [Branch]'e PR aç"
"PR #[numara] için Copilot review iste"
"PR #[numara]'yı base ile güncelle"
```

### Branch & Commit

```bash
"[Name] branch'i oluştur"
"Branch'leri listele"
"Son [N] commit'i göster"
"[Dosya]'yı commit et ve push et"
```

### Dosya İşlemleri

```bash
"[Dosya]'yı güncelle"
"[Dizin]'deki dosyaları listele"
"[Pattern]'e uyan dosyaları bul"
"Çoklu dosya güncellemesi yap"
```

### Arama

```bash
"[Anahtar kelime] içeren kodu bul"
"[Text]'li issue'ları ara"
"[Author]'ın commit'lerini göster"
"[Tarih]'ten sonraki değişiklikleri listele"
```

## 🔥 Hızlı Workflow'lar

### Bug Fix

```
Issue aç → Copilot'a ata → PR oluştur → Review iste → Merge
```

### Feature

```
Branch oluştur → Kod yaz → Commit → PR aç → Review
```

### Cleanup

```
Sorunları bul → Düzelt → Test et → PR aç
```

## 💡 Pro İpuçları

1. **Copilot Coding Agent**: Büyük görevler için hashtag kullan

   ```
   "[Görev] #github-pull-request_copilot-coding-agent"
   ```

2. **Toplu İşlem**: Birden fazla dosyayı tek komutta işle

   ```
   "src/**/*.ts dosyalarındaki [pattern]'i değiştir"
   ```

3. **Semantic Arama**: Doğal dil kullan

   ```
   "Authentication logic nerede kullanılıyor?"
   ```

4. **Otomatik Review**: Her PR için Copilot review iste
   ```
   "Yeni PR'lar için otomatik Copilot review ayarla"
   ```

## 📌 Hatırlatmalar

- ✅ Issue önce, sonra kod
- ✅ Her değişiklik için PR
- ✅ Review zorunlu
- ✅ Test sonrası merge
- ⛔ Main branch'e direkt push yok
- ⛔ console.log kullanma (logger kullan)

## 🔗 Kaynaklar

- Detaylı kılavuz: `docs/github-mcp-server.md`
- Demo örnekleri: `docs/github-mcp-server-demo.md`
- AI rehberi: `CLAUDE.md`

---

**Şimdi dene!** → AI asistanına "Bu projedeki açık issue'ları göster" de
