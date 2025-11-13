# Katkıda Bulunma Kılavuzu

Dernek Yönetim Sistemi projesine katkıda bulunmak için teşekkür ederiz!

## 🎯 Hızlı Başlangıç

1. **Fork** yapın
2. **Branch** oluşturun (`git checkout -b feature/harika-ozellik`)
3. **Değişikliklerinizi** yapın ve test edin
4. **Commit** edin (`git commit -m 'feat: harika özellik eklendi'`)
5. **Push** yapın (`git push origin feature/harika-ozellik`)
6. **Pull Request** oluşturun

## 📋 Katkı Türleri

### 🐛 Bug Raporları

**Issues** sekmesinden "Bug report" şablonunu kullanarak bildirin. Şunları ekleyin:

- Hatanın açıklaması ve tekrar üretme adımları
- Beklenen vs gerçek davranış
- Ekran görüntüleri
- Ortam bilgileri (tarayıcı, OS, Node.js versiyonu)

### 💡 Feature Önerileri

**Issues** sekmesinden "Feature request" şablonunu kullanın:

- Özelliğin amacı ve kullanım senaryoları
- Önerilen implementasyon
- Alternatif çözümler

### 🔧 Kod Katkıları

#### Geliştirme Ortamı

```bash
# 1. Fork & Clone
git clone https://github.com/YOUR_USERNAME/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi

# 2. Dependencies
npm install

# 3. Environment setup
cp .env.example .env.local
# .env.local dosyasını doldurun

# 4. Convex setup
npx convex dev

# 5. Dev server
npm run dev
```

Detaylı kurulum için [README.md](README.md) ve [docs/ENVIRONMENT.md](docs/ENVIRONMENT.md) dosyalarına bakın.

#### Branch Stratejisi

- `main` - Production kodu (korumalı)
- `feature/*` - Yeni özellikler (`feature/user-profile`)
- `bugfix/*` - Hata düzeltmeleri (`bugfix/login-error`)
- `hotfix/*` - Acil production düzeltmeleri

#### Commit Mesajları

**Conventional Commits** standardını kullanın:

```
<type>(<scope>): <description>

[optional body]
```

**Tipler:**

- `feat:` - Yeni özellik
- `fix:` - Hata düzeltme
- `docs:` - Dokümantasyon
- `style:` - Kod formatı (loglama değil)
- `refactor:` - Kod refactor
- `test:` - Test ekleme/düzeltme
- `chore:` - Build, dependency güncellemeleri

**Örnekler:**

```bash
feat(auth): add two-factor authentication
fix(api): resolve user creation bug
docs(readme): update installation instructions
refactor(utils): simplify date formatting
```

## 🎨 Kod Stili

### TypeScript

```typescript
// ✅ İyi
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Kötü
type User = {
  id: any; // 'any' kullanmayın
  name: string;
};
```

### React Components

```typescript
// ✅ İyi - Functional component + type
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({
  children,
  onClick,
  variant = 'primary'
}: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
}
```

### CSS/Tailwind

- **Tailwind utility classes** kullanın
- Custom CSS'den kaçının
- Responsive design uygulayın

```typescript
// ✅ İyi
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Kötü - inline styles
<div style={{ display: 'flex', padding: '16px' }}>
```

### Otomatik Format

```bash
# Lint check
npm run lint:check

# Lint fix
npm run lint:fix

# Format
npm run format

# Type check
npm run typecheck
```

**Pre-commit hooks** otomatik çalışır (Husky + lint-staged).

## 🧪 Test

### Test Yazma

```bash
# Testleri çalıştır
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# E2E
npm run e2e
```

### Test Best Practices

- Test dosyaları: `*.test.ts(x)` veya `*.spec.ts(x)`
- Her component için test yazın
- Edge case'leri test edin
- Açıklayıcı test isimleri kullanın

```typescript
// ✅ İyi - açıklayıcı test
describe('Button', () => {
  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 🔄 Pull Request Süreci

### PR Oluşturmadan Önce

- [ ] Kod lint/format edildi
- [ ] Type check geçiyor
- [ ] Testler geçiyor
- [ ] Değişiklikler test edildi

### PR Şablonu

```markdown
## Açıklama

Bu PR'da yapılan değişikliklerin kısa açıklaması...

## Değişiklik Türü

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Test

- [ ] Unit testler eklendi/güncellendi
- [ ] E2E testler eklendi/güncellendi
- [ ] Manuel test yapıldı

## Screenshots (varsa)

...

## Checklist

- [ ] Kod review yapıldı
- [ ] Testler geçiyor
- [ ] Dokümantasyon güncellendi
```

### Review Süreci

1. **Otomatik kontroller** - CI/CD pipeline (lint, test, build)
2. **Kod review** - En az 1 maintainer onayı
3. **Testler** - Tüm testler yeşil
4. **Merge** - Squash merge tercih edilir

## 📚 Dokümantasyon

### Katkıda Bulunabileceğiniz Alanlar

- README iyileştirmeleri
- API dokümantasyonu ([docs/API.md](docs/API.md))
- Kod yorumları (sadece gerektiğinde)
- Wiki sayfaları
- Tutorial ve örnekler

### Dokümantasyon Stili

- Türkçe yazın (ana dil)
- Kısa ve öz olsun
- Kod örnekleri ekleyin
- Screenshot'lar kullanın

## 🌍 Çeviri

Multi-language desteği için katkı:

- UI metinlerinin İngilizce çevirisi
- Dokümantasyon çevirileri
- i18n altyapısı geliştirme

## ❓ Sık Sorulan Sorular

### "Convex dev çalışmıyor"

```bash
npm install -g convex
npx convex dev
```

### "Lint hataları alıyorum"

```bash
npm run lint:fix
```

### "Testler başarısız"

```bash
# Cache temizle
npm run clean
npm install
npm test
```

### "PR'ım merge olmadı"

- CI/CD geçiyor mu?
- Kod review onayı var mı?
- Conflicts çözüldü mü?

## 📞 İletişim

- **Issues:** Sorularınız için GitHub Issues kullanın
- **Discussions:** Genel tartışmalar için GitHub Discussions
- **Security:** Güvenlik açıkları için özel olarak bildirin

## 🙏 Teşekkürler

Her katkınız değerlidir! Projeyi geliştirmede bize yardımcı olduğunuz için teşekkür ederiz.

---

## 📚 İlgili Dokümantasyon

- [README](README.md) - Proje genel bakış
- [TODO](docs/TODO.md) - Planlanan özellikler
- [DEPLOYMENT](docs/DEPLOYMENT.md) - Deploy rehberi
- [ENVIRONMENT](docs/ENVIRONMENT.md) - Environment variables
- [API](docs/API.md) - API dokümantasyonu
- [CHANGELOG](CHANGELOG.md) - Değişiklik geçmişi
