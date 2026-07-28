"""Certificat de qualité NIANKA — document imprimable gravé d'un QR Code.

Le certificat est rendu en HTML autonome (aucune ressource externe) avec une
feuille de style d'impression : « Imprimer → Enregistrer au format PDF » produit
le certificat officiel attendu à l'étape 5 du guide.
"""

import html
import json
from datetime import datetime
from typing import Any, Dict, Optional

try:
    import qrcode
    _QR_DISPONIBLE = True
except ImportError:  # pragma: no cover - dépendance optionnelle
    _QR_DISPONIBLE = False


VERT_NIANKA = "#1a6b0a"


def _qr_svg(payload: str, taille_px: int = 190) -> str:
    """QR Code rendu en SVG pur (aucune dépendance image, aucun fichier)."""
    if not _QR_DISPONIBLE:
        return (
            f'<div style="width:{taille_px}px;height:{taille_px}px;border:2px dashed #CBD5E1;'
            'display:flex;align-items:center;justify-content:center;font-size:11px;'
            'color:#64748B;text-align:center;padding:8px;">QR Code indisponible<br>'
            '(module « qrcode » non installé)</div>'
        )

    qr = qrcode.QRCode(version=None, box_size=1, border=2,
                       error_correction=qrcode.constants.ERROR_CORRECT_M)
    qr.add_data(payload)
    qr.make(fit=True)
    matrice = qr.get_matrix()
    n = len(matrice)

    rects = "".join(
        f'<rect x="{x}" y="{y}" width="1" height="1"/>'
        for y, ligne in enumerate(matrice)
        for x, noir in enumerate(ligne)
        if noir
    )
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{taille_px}" height="{taille_px}" '
        f'viewBox="0 0 {n} {n}" shape-rendering="crispEdges" role="img" '
        f'aria-label="QR Code de traçabilité NIANKA">'
        f'<rect width="{n}" height="{n}" fill="#ffffff"/>'
        f'<g fill="#0F172A">{rects}</g></svg>'
    )


def _txt(valeur: Any, defaut: str = "—") -> str:
    if valeur is None or valeur == "":
        return defaut
    return html.escape(str(valeur))


def _date_fr(valeur: Any) -> str:
    if not valeur:
        return "—"
    if isinstance(valeur, str):
        try:
            valeur = datetime.fromisoformat(valeur.replace("Z", "+00:00"))
        except ValueError:
            return html.escape(valeur)
    return valeur.strftime("%d/%m/%Y à %H:%M UTC")


def _ligne(libelle: str, valeur: str, fort: bool = False) -> str:
    poids = "800" if fort else "600"
    couleur = VERT_NIANKA if fort else "#0F172A"
    return (
        '<div class="ligne">'
        f'<span class="lib">{libelle}</span>'
        f'<span class="val" style="font-weight:{poids};color:{couleur}">{valeur}</span>'
        "</div>"
    )


def render_certificat_html(bordereau: Dict[str, Any], arbitrage: Optional[Dict[str, Any]] = None) -> str:
    """Assemble le certificat à partir du bordereau enrichi et, s'il existe,
    de l'arbitrage qui a scellé la vente."""

    numero = _txt(bordereau.get("numero_bordereau"))
    scan = bordereau.get("scan_initial") or {}

    kor_initial = bordereau.get("kor_initial")
    humidite_initiale = bordereau.get("humidite_initiale")

    scelle = arbitrage is not None
    kor_entrepot = arbitrage.get("kor_entrepot") if scelle else None
    humidite_entrepot = arbitrage.get("humidite_entrepot") if scelle else None
    delta = arbitrage.get("delta_kor") if scelle else None
    conforme = arbitrage.get("verdict_conforme") if scelle else None

    if not scelle:
        bandeau_texte = "EN TRANSIT — VENTE NON ENCORE SCELLÉE"
        bandeau_bg, bandeau_fg = "#FEF3C7", "#92400E"
    elif conforme:
        bandeau_texte = "CONFORME — ARBITRAGE IA NIANKA CERTIFIÉ"
        bandeau_bg, bandeau_fg = "#ECFDF5", "#065F46"
    else:
        bandeau_texte = "ÉCART DÉTECTÉ AU DÉCHARGEMENT — VOIR DÉTAIL"
        bandeau_bg, bandeau_fg = "#FEF2F2", "#991B1B"

    payload_qr = json.dumps({
        "certificat": numero,
        "cooperative": bordereau.get("nom_cooperative"),
        "agent": bordereau.get("nom_agent"),
        "entrepot": bordereau.get("nom_entrepot"),
        "grade": bordereau.get("grade_lot"),
        "volume_tonnes": bordereau.get("volume_tonnes"),
        "kor_initial": kor_initial,
        "kor_arbitrage": kor_entrepot,
        "conforme": conforme,
        "camion": bordereau.get("immatriculation_camion"),
        "gps": [scan.get("gps_lat"), scan.get("gps_long")],
    }, ensure_ascii=False)

    def _mesure(valeur: Any, unite: str) -> str:
        return f"{valeur} {unite}" if valeur is not None else "—"

    bloc_arbitrage = (
        '<div class="colonne">'
        '<h3>Scan d’arbitrage — Entrepôt central</h3>'
        + _ligne("Rendement KOR", _mesure(kor_entrepot, "lbs"), fort=True)
        + _ligne("Humidité", _mesure(humidite_entrepot, "%"))
        + _ligne("Écart KOR constaté", _mesure(delta, "lbs"), fort=True)
        + _ligne("Inspecteur", _txt(arbitrage.get("nom_entrepot")))
        + _ligne("Scellé le", _date_fr(arbitrage.get("scelle_a")))
        + "</div>"
    ) if scelle else (
        '<div class="colonne">'
        '<h3>Scan d’arbitrage — Entrepôt central</h3>'
        '<p class="attente">Le lot n’a pas encore été réceptionné et arbitré à '
        'l’entrepôt central. Le certificat définitif sera émis au déchargement.</p>'
        "</div>"
    )

    bloc_acheteur = (
        _ligne("Acheteur", _txt(arbitrage.get("nom_acheteur")), fort=True)
        + _ligne("Statut de la vente", _txt(arbitrage.get("statut_vente")))
    ) if scelle else ""

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Certificat NIANKA {numero}</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{
    margin: 0; padding: 28px;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: #F1F5F9; color: #0F172A;
  }}
  .feuille {{
    max-width: 820px; margin: 0 auto; background: #fff; border-radius: 16px;
    padding: 36px 40px; box-shadow: 0 10px 40px rgba(15,23,42,.12);
  }}
  header {{ display: flex; justify-content: space-between; align-items: flex-start;
           border-bottom: 3px solid {VERT_NIANKA}; padding-bottom: 18px; }}
  .marque {{ font-size: 30px; font-weight: 900; letter-spacing: -.03em; color: {VERT_NIANKA}; }}
  .sous-marque {{ font-size: 11.5px; color: #64748B; font-weight: 600; margin-top: 2px; }}
  .ref {{ text-align: right; }}
  .ref .num {{ font-size: 19px; font-weight: 900; font-family: ui-monospace, "Consolas", monospace; }}
  .ref .date {{ font-size: 11.5px; color: #64748B; margin-top: 4px; }}
  .bandeau {{
    margin: 22px 0; padding: 13px 18px; border-radius: 10px; text-align: center;
    font-weight: 900; font-size: 13.5px; letter-spacing: .04em;
    background: {bandeau_bg}; color: {bandeau_fg};
  }}
  .grille {{ display: grid; grid-template-columns: 1fr 1fr; gap: 26px; }}
  .colonne h3 {{
    font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase;
    color: #64748B; margin: 0 0 12px; padding-bottom: 6px; border-bottom: 1px solid #E2E8F0;
  }}
  .ligne {{ display: flex; justify-content: space-between; gap: 14px; padding: 6px 0;
           font-size: 12.5px; border-bottom: 1px dashed #F1F5F9; }}
  .lib {{ color: #64748B; font-weight: 600; }}
  .val {{ text-align: right; }}
  .attente {{ font-size: 12.5px; color: #92400E; background: #FFFBEB;
             padding: 12px; border-radius: 8px; line-height: 1.5; margin: 0; }}
  .pied {{ display: flex; justify-content: space-between; align-items: center;
          gap: 26px; margin-top: 30px; padding-top: 22px; border-top: 1px solid #E2E8F0; }}
  .mentions {{ font-size: 10.5px; color: #64748B; line-height: 1.65; max-width: 480px; }}
  .qr {{ text-align: center; }}
  .qr .legende {{ font-size: 9.5px; color: #94A3B8; margin-top: 6px; font-weight: 700;
                 letter-spacing: .05em; text-transform: uppercase; }}
  .imprimer {{
    display: block; margin: 22px auto 0; padding: 12px 26px; border: none;
    border-radius: 10px; background: {VERT_NIANKA}; color: #fff;
    font-size: 14px; font-weight: 800; cursor: pointer;
  }}
  @media print {{
    body {{ background: #fff; padding: 0; }}
    .feuille {{ box-shadow: none; border-radius: 0; max-width: none; padding: 12mm; }}
    .imprimer {{ display: none; }}
    @page {{ size: A4; margin: 10mm; }}
  }}
</style>
</head>
<body>
<div class="feuille">
  <header>
    <div>
      <div class="marque">NIANKA</div>
      <div class="sous-marque">Certificat de qualité &amp; traçabilité — Filière anacarde, Côte d’Ivoire</div>
    </div>
    <div class="ref">
      <div class="num">{numero}</div>
      <div class="date">Émis le {_date_fr(bordereau.get('created_at'))}</div>
    </div>
  </header>

  <div class="bandeau">{bandeau_texte}</div>

  <div class="grille">
    <div class="colonne">
      <h3>Origine &amp; collecte bord champ</h3>
      {_ligne("Coopérative", _txt(bordereau.get("nom_cooperative")), fort=True)}
      {_ligne("Agent pisteur", _txt(bordereau.get("nom_agent")))}
      {_ligne("Grade IA à la collecte", _txt(scan.get("grade_ia")))}
      {_ligne("Rendement KOR", _mesure(kor_initial, "lbs"), fort=True)}
      {_ligne("Humidité", _mesure(humidite_initiale, "%"))}
      {_ligne("Géolocalisation", (f"{scan.get('gps_lat'):.4f}, {scan.get('gps_long'):.4f}"
                                   if scan.get("gps_lat") is not None and scan.get("gps_long") is not None
                                   else "—"))}
      {_ligne("Date du scan", _date_fr(scan.get("date_scan")))}
    </div>

    {bloc_arbitrage}
  </div>

  <div class="grille" style="margin-top:26px">
    <div class="colonne">
      <h3>Lot &amp; logistique</h3>
      {_ligne("Grade commercial", _txt(bordereau.get("grade_lot")), fort=True)}
      {_ligne("Volume", _mesure(bordereau.get("volume_tonnes"), "tonnes"), fort=True)}
      {_ligne("Camion", _txt(bordereau.get("immatriculation_camion")))}
      {_ligne("Chauffeur", _txt(bordereau.get("nom_chauffeur")))}
      {_ligne("Entrepôt central", _txt(bordereau.get("nom_entrepot")))}
      {bloc_acheteur}
    </div>

    <div class="colonne">
      <h3>Vérification</h3>
      <p class="attente" style="background:#F8FAFC;color:#475569">
        Scannez le QR Code ci-dessous pour vérifier l’intégralité de la chaîne de
        traçabilité de ce lot, du champ jusqu’à l’entrepôt central.
      </p>
    </div>
  </div>

  <div class="pied">
    <div class="mentions">
      <strong>Arbitrage neutre certifié.</strong> Ce certificat atteste que l’échantillon
      de 500&nbsp;g prélevé sur ce lot a été analysé par le moteur d’inférence NIANKA
      au bord champ puis, contradictoirement, au déchargement à l’entrepôt central agréé.
      L’écart de rendement KOR constaté entre les deux mesures fait foi entre la
      coopérative vendeuse et l’acheteur.<br><br>
      Document généré automatiquement par la plateforme NIANKA — toute altération
      invalide le QR Code de vérification.
    </div>
    <div class="qr">
      {_qr_svg(payload_qr)}
      <div class="legende">Traçabilité NIANKA</div>
    </div>
  </div>
</div>

<button class="imprimer" onclick="window.print()">Imprimer / Enregistrer en PDF</button>
</body>
</html>"""
