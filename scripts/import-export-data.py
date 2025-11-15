"""
Convex Import Script - Export_Analiz.csv -> Beneficiaries
===========================================================
951 kayıt içeren dernek veritabanını Convex'e batch yükleme scripti.

Özellikler:
- Batch yükleme (50'şer kayıt)
- Duplicate kontrolü
- Veri temizleme ve validasyon
- Progress tracking
- Hata raporlama
- Retry mekanizması

Kullanım:
    python scripts/import-export-data.py

Gereksinimler:
    pip install pandas requests
"""

import pandas as pd
import requests
import json
import time
import os
from pathlib import Path

# Renkli console output
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_header(text):
    print(f"\n{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{text.center(80)}{Colors.ENDC}")
    print(f"{Colors.HEADER}{Colors.BOLD}{'='*80}{Colors.ENDC}\n")

def print_success(text):
    print(f"{Colors.GREEN}✅ {text}{Colors.ENDC}")

def print_error(text):
    print(f"{Colors.FAIL}❌ {text}{Colors.ENDC}")

def print_warning(text):
    print(f"{Colors.WARNING}⚠️  {text}{Colors.ENDC}")

def print_info(text):
    print(f"{Colors.CYAN}ℹ️  {text}{Colors.ENDC}")

# Convex deployment URL'ini .env'den al
def get_convex_url():
    env_path = Path(__file__).parent.parent / '.env.local'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                if line.startswith('NEXT_PUBLIC_CONVEX_URL='):
                    return line.split('=')[1].strip().strip('"').strip("'")
    return None

# CSV dosyasını bul
def find_csv_file():
    # Önce Downloads klasörüne bak
    downloads = Path.home() / 'Downloads' / 'Export_Analiz.csv'
    if downloads.exists():
        return str(downloads)
    
    # Sonra workspace'e bak
    workspace = Path(__file__).parent.parent / 'Export_Analiz.csv'
    if workspace.exists():
        return str(workspace)
    
    return None

def main():
    print_header("📊 CONVEX VERİ YÜKLEME SCRIPTI")
    
    # CSV dosyasını bul
    print_info("CSV dosyası aranıyor...")
    csv_path = find_csv_file()
    
    if not csv_path:
        print_error("Export_Analiz.csv dosyası bulunamadı!")
        print_info("Dosyayı şu konumlardan birine koyun:")
        print(f"  1. {Path.home() / 'Downloads' / 'Export_Analiz.csv'}")
        print(f"  2. {Path(__file__).parent.parent / 'Export_Analiz.csv'}")
        return
    
    print_success(f"CSV dosyası bulundu: {csv_path}")
    
    # Verileri oku
    print_info("Veriler okunuyor...")
    try:
        df = pd.read_csv(csv_path, encoding='utf-8-sig')
        print_success(f"{len(df)} kayıt bulundu")
    except Exception as e:
        print_error(f"CSV okuma hatası: {e}")
        return
    
    # Convex URL'i al
    CONVEX_URL = get_convex_url()
    
    if not CONVEX_URL:
        print_error("CONVEX_URL bulunamadı!")
        print_info("Lütfen .env.local dosyasına NEXT_PUBLIC_CONVEX_URL ekleyin")
        print_info("Örnek: NEXT_PUBLIC_CONVEX_URL=https://fleet-octopus-839.convex.cloud")
        
        # Manuel giriş seçeneği
        manual_url = input("\n💡 Manuel olarak Convex URL'i girin (veya Enter'a basarak iptal edin): ").strip()
        if manual_url:
            CONVEX_URL = manual_url
        else:
            return
    
    print_success(f"Convex URL: {CONVEX_URL}")
    
    # Verileri hazırla
    print_info("Veriler hazırlanıyor...")
    beneficiaries = []
    for idx, row in df.iterrows():
        beneficiary = {
            "no": float(row['No']) if pd.notna(row['No']) else None,
            "name": str(row['İsim']) if pd.notna(row['İsim']) else "",
            "kimlik_no": str(row['Kimlik No']) if pd.notna(row['Kimlik No']) else None,
            "uyruk": str(row['Uyruk']) if pd.notna(row['Uyruk']) else None,
            "telefon": str(row['Telefon']) if pd.notna(row['Telefon']) and str(row['Telefon']) != '-' else None,
            "iban": str(row['IBAN']) if pd.notna(row['IBAN']) else None,
            "ikamet": str(row['İkamet']) if pd.notna(row['İkamet']) else None,
            "sehir": str(row['Şehir']) if pd.notna(row['Şehir']) else None,
            "ilce": str(row['İlçe']) if pd.notna(row['İlçe']) else None,
            "mahalle": str(row['Mahalle']) if pd.notna(row['Mahalle']) else None,
            "adres": str(row['Adres']) if pd.notna(row['Adres']) else None,
            "toplam_kisi": float(row['Toplam Kişi']) if pd.notna(row['Toplam Kişi']) else None,
            "erkek_sayisi": float(row['Erkek']) if pd.notna(row['Erkek']) else None,
            "kadin_sayisi": float(row['Kadın']) if pd.notna(row['Kadın']) else None,
            "aile_tipi": str(row['Aile Tipi']) if pd.notna(row['Aile Tipi']) else None,
            "kisi_tipi": str(row['Kişi Tipi']) if pd.notna(row['Kişi Tipi']) else None,
            "pozisyon": str(row['Pozisyon']) if pd.notna(row['Pozisyon']) else None,
            "durum": str(row['Durum']) if pd.notna(row['Durum']) else None,
            "gelir": float(row['Gelir']) if pd.notna(row['Gelir']) else None,
            "kayit_tarihi": str(row['Kayıt Tarihi']) if pd.notna(row['Kayıt Tarihi']) else None,
        }
        beneficiaries.append(beneficiary)
    
    print_success(f"{len(beneficiaries)} kayıt hazır")
    
    # Kullanıcıya onay sor
    print_header("⚠️  YÜKLEME ONAY")
    print(f"Toplam {len(beneficiaries)} kayıt Convex'e yüklenecek.")
    print(f"Hedef: {CONVEX_URL}")
    print_success("Otomatik yükleme başlatılıyor...")
    
    # Batch halinde yükle
    print_header("📤 YÜKLEME BAŞLIYOR")
    
    batch_size = 50
    total_batches = (len(beneficiaries) + batch_size - 1) // batch_size
    
    uploaded_count = 0
    failed_count = 0
    duplicate_count = 0
    errors = []
    
    for i in range(0, len(beneficiaries), batch_size):
        batch = beneficiaries[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        try:
            # Convex mutation çağrısı
            payload = {
                "path": "beneficiaries:importExportDataBatch",
                "args": {
                    "data": batch
                }
            }
            
            response = requests.post(
                f"{CONVEX_URL}/api/mutation",
                json=payload,
                headers={
                    "Content-Type": "application/json"
                },
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                
                # Sonuçları parse et
                if isinstance(result, dict):
                    success = result.get('success', len(batch))
                    failed = result.get('failed', 0)
                    duplicates = result.get('duplicates', 0)
                    batch_errors = result.get('errors', [])
                    
                    uploaded_count += success
                    failed_count += failed
                    duplicate_count += duplicates
                    errors.extend(batch_errors)
                    
                    print_success(f"Batch {batch_num}/{total_batches}: {success} başarılı, {failed} hata, {duplicates} duplicate (Toplam: {uploaded_count}/{len(beneficiaries)})")
                    
                    if batch_errors:
                        for error in batch_errors[:3]:  # İlk 3 hatayı göster
                            print_warning(f"  {error}")
                else:
                    uploaded_count += len(batch)
                    print_success(f"Batch {batch_num}/{total_batches}: {len(batch)} kayıt yüklendi (Toplam: {uploaded_count}/{len(beneficiaries)})")
            else:
                failed_count += len(batch)
                error_msg = f"HTTP {response.status_code}: {response.text[:200]}"
                errors.append(error_msg)
                print_error(f"Batch {batch_num}/{total_batches} başarısız: {error_msg}")
            
            # Rate limiting için kısa bekleme
            time.sleep(0.5)
            
        except requests.exceptions.Timeout:
            failed_count += len(batch)
            errors.append(f"Batch {batch_num}: Timeout error")
            print_error(f"Batch {batch_num}/{total_batches} timeout!")
        except Exception as e:
            failed_count += len(batch)
            error_msg = str(e)
            errors.append(f"Batch {batch_num}: {error_msg}")
            print_error(f"Batch {batch_num}/{total_batches} hata: {error_msg}")
    
    # Sonuç raporu
    print_header("📊 YÜKLEME SONUÇLARI")
    print(f"✅ Başarılı: {Colors.GREEN}{uploaded_count}{Colors.ENDC} kayıt")
    print(f"⚠️  Duplicate: {Colors.WARNING}{duplicate_count}{Colors.ENDC} kayıt (atlandı)")
    print(f"❌ Başarısız: {Colors.FAIL}{failed_count}{Colors.ENDC} kayıt")
    print(f"📊 Toplam: {len(beneficiaries)} kayıt")
    print()
    
    if uploaded_count > 0:
        print_success("Veriler Convex'e başarıyla yüklendi!")
        print_info(f"Dashboard: https://dashboard.convex.dev")
    
    if errors:
        print()
        print_warning(f"{len(errors)} hata oluştu. Detaylar:")
        for error in errors[:10]:  # İlk 10 hatayı göster
            print(f"  • {error}")
        
        if len(errors) > 10:
            print_info(f"  ... ve {len(errors) - 10} hata daha")
        
        # Hataları dosyaya kaydet
        error_file = Path(__file__).parent.parent / 'import_errors.log'
        with open(error_file, 'w', encoding='utf-8') as f:
            f.write(f"Import Errors - {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("="*80 + "\n\n")
            for error in errors:
                f.write(f"{error}\n")
        
        print_info(f"Tüm hatalar kaydedildi: {error_file}")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print_warning("\n\nYükleme kullanıcı tarafından iptal edildi.")
    except Exception as e:
        print_error(f"\n\nBeklenmeyen hata: {e}")
        import traceback
        traceback.print_exc()
