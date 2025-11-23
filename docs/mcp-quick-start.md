# MCP Hızlı Başlangıç

Model Context Protocol (MCP) sunucularını 5 dakikada kurun ve kullanmaya başlayın!

## 🚀 Hızlı Kurulum

### Cursor IDE Kullanıcıları

```bash
# 1. Yapılandırma dosyasını kopyalayın
cp .cursor/mcp_settings.example.json .cursor/mcp_settings.json

# 2. Credential'larınızı ekleyin
# .cursor/mcp_settings.json dosyasını editör ile açın
# Placeholder'ları gerçek credential'larla değiştirin

# 3. Cursor IDE'yi yeniden başlatın
```

### Claude Desktop Kullanıcıları

```bash
# macOS
open ~/Library/Application\ Support/Claude/claude_desktop_config.json

# Linux
nano ~/.config/Claude/claude_desktop_config.json

# Windows
notepad %APPDATA%\Claude\claude_desktop_config.json
```

Yapılandırmayı `.cursor/mcp_settings.example.json` dosyasından kopyalayın ve credential'larınızı ekleyin.

## 🔑 Credential'ları Alma

### Appwrite

1. [Appwrite Console](https://cloud.appwrite.io/) → Projenizi seçin
2. **Overview** > **Integrations** > **API Keys**
3. **Create API Key** → İzinleri seçin → Kopyalayın

### GitHub

1. [GitHub Settings](https://github.com/settings/tokens) → **Personal access tokens**
2. **Generate new token (classic)**
3. İzinler: `repo`, `read:org`, `workflow`
4. Token'ı kopyalayın

## ✅ Test Edin

AI asistanınıza şu komutları verin:

```
"Appwrite'da kaç kullanıcı var?"
"Bu repository'deki açık issue'ları göster"
"google.com'u ziyaret et ve screenshot al"
```

## 📚 Detaylı Rehberler

- [MCP Kurulum Rehberi](./mcp-setup.md) - Tüm detaylar
- [Claude Desktop Kurulumu](./claude-desktop-mcp-setup.md) - Claude Desktop özellikleri
- [Appwrite MCP Kullanımı](./appwrite-mcp-guide.md) - Appwrite örnekleri
- [GitHub MCP Kullanımı](./github-mcp-server.md) - GitHub örnekleri

## 🆘 Sorun mu var?

**Problem**: MCP sunucusu başlamıyor

**Çözüm**:
```bash
# Node.js paketleri için
npm install -g @modelcontextprotocol/server-github

# Python için
pip install uv
```

**Problem**: Authentication hatası

**Çözüm**: Credential'ları kontrol edin, geçerli olduğundan emin olun

**Daha fazla**: [Sorun Giderme Bölümü](./mcp-setup.md#sorun-giderme)

## 🎯 Sıradaki Adımlar

1. ✅ MCP sunucularını test edin
2. ✅ [Örnek komutları](./mcp-setup.md#örnek-workflows) deneyin
3. ✅ Kendi workflow'larınızı oluşturun

---

**Hazır!** Artık AI asistanınız Appwrite, GitHub ve daha fazlasıyla etkileşime girebilir! 🎉
