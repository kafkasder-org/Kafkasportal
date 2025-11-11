# Katkıda Bulunma Kılavuzu

Dernek Yönetim Sistemi projesine katkıda bulunmak için teşekkür ederiz! Bu kılavuz, katkı sürecini anlamanıza ve projeye etkili bir şekilde katkıda bulunmanıza yardımcı olacaktır.

## 🎯 Hızlı Başlangıç

1. **Fork** yapın
2. **Branch** oluşturun (`git checkout -b feature/harika-ozellik`)
3. **Değişikliklerinizi** yapın
4. **Test** edin
5. **Commit** edin (`git commit -m 'feat: harika özellik eklendi'`)
6. **Push** yapın (`git push origin feature/harika-ozellik`)
7. **Pull Request** oluşturun

## 📋 Katkı Türleri

### 🐛 Bug Raporları

Bir hata bulduğunuzda:

1. **Issues** sekmesine gidin
2. "Bug report" şablonunu kullanın
3. Aşağıdaki bilgileri ekleyin:
   - Hatanın açıklaması
   - Tekrar üretme adımları
   - Beklenen davranış
   - Gerçek davranış
   - Ekran görüntüleri
   - Ortam bilgileri (tarayıcı, OS)

### 💡 Feature Önerileri

Yeni bir özellik önermek için:

1. **Issues** sekmesine gidin
2. "Feature request" şablonunu kullanın
3. Aşağıdakileri açıklayın:
   - Özelliğin amacı
   - Kullanım senaryoları
   - Önerilen implementasyon
   - Alternatif çözümler

### 🔧 Kod Katkıları

#### Geliştirme Ortamı Kurulumu

```bash
# 1. Fork yapın ve klonlayın
git clone https://github.com/YOUR_USERNAME/dernek-yonetim-sistemi.git
cd dernek-yonetim-sistemi

# 2. Bağımlılıkları yükleyin
npm install

# 3. Geliştirme sunucusunu başlatın
npm run dev
```

#### Branch Stratejisi

- `main` - Production kodu
- `develop` - Geliştirme branch'i
- `feature/*` - Yeni özellikler
- `bugfix/*` - Hata düzeltmeleri
- `hotfix/*` - Acil düzeltmeler

#### Commit Mesajları

Conventional Commits standardını kullanın:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Tipler:**
- `feat:` - Yeni özellik
- `fix:` - Hata düzeltme
- `docs:` - Dokümantasyon değişiklikleri
- `style:` - Kod stili değişiklikleri
- `refactor:` - Kod refactor'ü
- `test:` - Test eklemeleri/düzeltmeleri
- `chore:` - Yapılandırma değişiklikleri

**Örnekler:**
```bash
feat(auth): add two-factor authentication
fix(api): resolve user creation bug
docs(readme): update installation instructions
```

### 📚 Dokümantasyon

- README dosyalarını güncelleyin
- Kod yorumlarını ekleyin/iyileştirin
- Wiki sayfaları oluşturun
- Örnekler ve tutorial'lar yazın

### 🌍 Çeviri

- Türkçe → İngilizce çeviriler
- UI metinlerinin yerelleştirilmesi
- Dokümantasyon çevirileri

## 🧪 Test

### Test Türleri

1. **Birim Testleri** - Component ve utility testleri
2. **Entegrasyon Testleri** - API ve veritabanı testleri
3. **E2E Testleri** - Kullanıcı akışı testleri

### Test Komutları

```bash
# Tüm testleri çalıştır
npm test

# Testleri izleme modunda çalıştır
npm run test:watch

# Coverage raporu oluştur
npm run test:coverage

# E2E testleri
npm run test:e2e
```

### Test Yazma En İyi Uygulamaları

- Test dosyalarını `*.test.ts(x)` veya `*.spec.ts(x)` olarak adlandırın
- Her component için en az bir test yazın
- Edge case'leri test edin
- Mock data kullanın
- Test isimleri açıklayıcı olsun

#### Örnek Test

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react'
import Button from './Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    screen.getByText('Click me').click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## 🎨 Kod Stili

### TypeScript

- Tür tanımlamaları kullanın, `any` tipinden kaçının
- Interface'ler type alias'lara tercih edin
- Generic'leri uygun şekilde kullanın

```typescript
// ✅ İyi
interface User {
  id: string
  name: string
  email: string
}

// ❌ Kötü
type User = {
  id: any
  name: string
  email: string
}
```

### React Component'leri

- Functional component'leri tercih edin
- Custom hook'ları kullanın
- Props interface'lerini tanımlayın

```typescript
// ✅ İyi
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}
```

### CSS ve Stil

- Tailwind CSS utility class'larını kullanın
- Custom CSS'den kaçının
- Responsive design prensiplerini uygulayın

```typescript
// ✅ İyi
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">

// ❌ Kötü
<div style={{ 
  display: 'flex', 
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '16px',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
}}>
```

## 📁 Proje Yapısı

```
src/
├── app/                    # Next.js App Router
├── components/            # React component'leri
│   ├── ui/               # Temel UI component'leri
│   └── layouts/          # Layout component'leri
├── lib/                   # Yardımcı fonksiyonlar
├── hooks/                 # Custom React hook'ları
├── stores/               # Zustand store'ları
├── types/                # TypeScript tipleri
└── utils/                 # Utility fonksiyonlar
```

## 🔄 Pull Request Süreci

### PR Oluşturma

1. **Başlık** - Açıklayıcı ve kısa başlık
2. **Açıklama** - Değişikliklerin detaylı açıklaması
3. **Related Issues** - İlgili issue'ları bağlayın
4. **Screenshots** - UI değişiklikleri için ekran görüntüleri
5. **Testler** - Yazılan testleri belirtin

### PR Şablonu

```markdown
## Açıklama
Bu PR'da yapılan değişikliklerin açıklaması...

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testler
- [ ] Unit test'ler eklendi/güncellendi
- [ ] E2E test'ler eklendi/güncellendi
- [ ] Manuel test yapıldı

## Screenshots (varsa)
Before/After ekran görüntüleri...

## Checklist
- [ ] Kod review yapıldı
- [ ] Test'ler geçiyor
- [ ] Dokümantasyon güncellendi
- [ ] Breaking change varsa belirtildi
```

### Review Süreci

1. **Otomatik kontroller** - CI/CD pipeline'ı
2. **Kod review** - En az 1 onay gerekli
3. **Test'ler** - Tüm test'ler geçmeli
4. **Merge** - Squash merge tercih edilir

## 🚀 Release Süreci

### Version Semantics

- **MAJOR** - Breaking changes (1.0.0)
- **MINOR** - Yeni özellikler (0.1.0)
- **PATCH** - Bug düzeltmeleri (0.0.1)

### Changelog

Her release için `CHANGELOG.md` güncellenir:

```markdown
## [1.2.0] - 2024-01-15
### Added
- Yeni kullanıcı rolü: Gönüllü
- Advanced search özelliği

### Changed
- Dashboard layout güncellendi

### Fixed
- Mobile navigation bug'ı düzeltildi
```

## 🆘 Yardım

### Sorularınız mı var?

- **GitHub Discussions** - Genel sorular için
- **GitHub Issues** - Bug ve feature request'ler için
- **Wiki** - Dokümantasyon için

### Kaynaklar

- [Next.js Dokümantasyonu](https://nextjs.org/docs)
- [Convex Dokümantasyonu](https://docs.convex.dev/)
- [Tailwind CSS Dokümantasyonu](https://tailwindcss.com/docs)
- [TypeScript Dokümantasyonu](https://www.typescriptlang.org/docs/)

## 📞 İletişim

- **Project Maintainers** - @your-username
- **Discord** - [Join our Discord](https://discord.gg/your-invite)
- **Email** - contact@your-project.com

---

**Katılımınız için teşekkürler!** 🎉 Bu projeyi birlikte harika bir hale getireceğiz.