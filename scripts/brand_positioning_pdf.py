"""Generate the Vadal.ai brand positioning PDF (3 directions + recommendation)."""

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

W, H = A4
M = 56  # page margin

INK = HexColor("#16161a")
MUTED = HexColor("#6e6e78")
FAINT = HexColor("#a8a8b0")
LINE = HexColor("#e8e8ec")
PAPER = HexColor("#ffffff")

DIRECTIONS = [
    {
        "num": "01",
        "name": "The quiet authority",
        "promise": "People intelligence you can take to the board",
        "positioning": (
            "For CHROs and people leaders who make crore-level workforce decisions, "
            "Vadal is the people-intelligence platform that turns employee signals into "
            "board-grade decisions — with the calm precision of a private bank, not the "
            "noise of an HR tool."
        ),
        "taglines": [
            "Know your people. Early.",
            "People decisions, decision-grade.",
            "The intelligence layer for your workforce.",
        ],
        "voice": "Assured, measured, expert. Short declarative sentences. Numbers do the talking.",
        "palette": [
            ("#171B2C", "Ink navy", "type / authority"),
            ("#5266EB", "Periwinkle", "brand / action"),
            ("#8DA2FF", "Soft periwinkle", "data viz"),
            ("#F6F6F4", "Warm paper", "canvas"),
            ("#1E9E6A", "Sage", "positive signal"),
        ],
        "type": "Inter or Sohne — tabular numbers, superscript details",
        "maps": "Fintech calm dashboard (Mercury reference)",
        "risk": "Can read as cold if the photography and illustration layer is not human.",
    },
    {
        "num": "02",
        "name": "The human pulse",
        "promise": "Keeping companies human at scale",
        "positioning": (
            "For organizations that believe engagement is human before it is metric, "
            "Vadal is the platform that keeps companies human at scale — it listens, "
            "notices, and nudges care before people burn out or walk out."
        ),
        "taglines": [
            "The heartbeat of your workplace.",
            "Listen at scale. Act in time.",
            "People first. Proof always.",
        ],
        "voice": "Warm, editorial, empathetic — speaks like a great chief of staff, not a vendor.",
        "palette": [
            ("#2E2436", "Deep plum", "type"),
            ("#F2705B", "Coral", "brand / warmth"),
            ("#F6A14B", "Amber", "energy"),
            ("#FBF7EF", "Cream", "canvas"),
            ("#33B28A", "Jade", "growth"),
        ],
        "type": "Fraunces display + Inter body",
        "maps": "Lumen dashboard (editorial reference)",
        "risk": "Warm wellness aesthetics are crowded (Culture Amp, Lattice territory) — differentiation must come from the AI-prediction story.",
    },
    {
        "num": "03",
        "name": "The daily ritual",
        "promise": "The people app teams actually open",
        "positioning": (
            "For modern workforces where Gen Z is the majority, Vadal is the people "
            "platform employees actually open — streaks, missions, and recognition that "
            "make engagement a daily habit, while leaders get the intelligence underneath."
        ),
        "taglines": [
            "Engagement, daily.",
            "Culture has a pulse. Check it.",
            "Work, but make it a streak.",
        ],
        "voice": "Bold, direct, a little playful — confident monochrome with electric moments.",
        "palette": [
            ("#0D0D0F", "Near black", "brand — black is the color"),
            ("#F2F2F4", "Light gray", "canvas"),
            ("#5D63E1", "Indigo", "action"),
            ("#EFD24A", "Yellow", "score / celebration"),
            ("#E8584C", "Signal red", "risk only"),
        ],
        "type": "Space Grotesk + Inter — 800-weight numbers",
        "maps": "GenAlpha dashboard (Cal AI reference)",
        "risk": "Boldness can undercut enterprise-buyer trust in procurement conversations.",
    },
]


def wrap(text, font, size, max_w):
    words, lines, cur = text.split(), [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if stringWidth(trial, font, size) <= max_w:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, text, x, y, font, size, color, max_w, leading=None):
    leading = leading or size * 1.45
    c.setFont(font, size)
    c.setFillColor(color)
    for ln in wrap(text, font, size, max_w):
        c.drawString(x, y, ln)
        y -= leading
    return y


def label(c, text, x, y):
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(FAINT)
    c.drawString(x, y, text.upper())
    return y - 16


def footer(c, page):
    c.setFont("Helvetica", 8)
    c.setFillColor(FAINT)
    c.drawString(M, 34, "vadal.ai — brand positioning")
    c.drawRightString(W - M, 34, f"{page:02d}")


def swatch_row(c, palette, x, y, total_w):
    n = len(palette)
    gap = 8
    sw = (total_w - gap * (n - 1)) / n
    for i, (hexv, name, role) in enumerate(palette):
        sx = x + i * (sw + gap)
        c.setFillColor(HexColor(hexv))
        c.setStrokeColor(LINE)
        c.roundRect(sx, y, sw, 54, 7, stroke=1, fill=1)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 8.5)
        c.drawString(sx, y - 14, name)
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 7.5)
        c.drawString(sx, y - 25, hexv)
        for j, ln in enumerate(wrap(role, "Helvetica", 7.5, sw)):
            c.drawString(sx, y - 36 - j * 9, ln)
    return y - 56


def cover(c):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    # top brand mark
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(M, H - 78, "vadal.ai")
    c.setFont("Helvetica", 9)
    c.setFillColor(MUTED)
    c.drawRightString(W - M, H - 78, "June 2026 · prepared for the oliandhue team")
    c.setStrokeColor(LINE)
    c.line(M, H - 94, W - M, H - 94)

    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 34)
    c.drawString(M, H - 190, "Brand positioning.")
    c.drawString(M, H - 232, "Three directions.")
    para(
        c,
        "Vadal.ai is an AI-powered employee-engagement platform: workforce health, "
        "attrition and risk intelligence, employee voice and sentiment, recognition and "
        "culture, manager effectiveness, and business-impact correlation. This document "
        "proposes three distinct brand territories — each with positioning, voice, color "
        "and type — and closes with a recommendation.",
        M, H - 274, "Helvetica", 10.5, MUTED, W - 2 * M - 120,
    )

    # three preview strips
    y = H - 420
    for d in DIRECTIONS:
        c.setFillColor(FAINT)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(M, y + 40, f"DIRECTION {d['num']}")
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 14)
        c.drawString(M, y + 22, d["name"])
        c.setFillColor(MUTED)
        c.setFont("Helvetica", 9.5)
        c.drawString(M, y + 7, d["promise"])
        # mini swatches right-aligned
        sw, gap = 38, 6
        total = 5 * sw + 4 * gap
        sx0 = W - M - total
        for i, (hexv, _, _) in enumerate(d["palette"]):
            c.setFillColor(HexColor(hexv))
            c.setStrokeColor(LINE)
            c.roundRect(sx0 + i * (sw + gap), y + 6, sw, 38, 5, stroke=1, fill=1)
        y -= 86

    footer(c, 1)
    c.showPage()


def direction_page(c, d, page):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    cw = W - 2 * M

    c.setFillColor(FAINT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M, H - 70, f"DIRECTION {d['num']}")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 27)
    c.drawString(M, H - 100, d["name"])
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 12)
    c.drawString(M, H - 122, d["promise"])
    c.setStrokeColor(LINE)
    c.line(M, H - 140, W - M, H - 140)

    y = H - 166
    y = label(c, "Positioning", M, y)
    y = para(c, d["positioning"], M, y, "Helvetica", 10.5, INK, cw) - 14

    y = label(c, "Taglines", M, y)
    c.setFont("Helvetica", 10.5)
    c.setFillColor(INK)
    for t in d["taglines"]:
        c.drawString(M, y, "—  " + t)
        y -= 16
    y -= 14

    y = label(c, "Voice", M, y)
    y = para(c, d["voice"], M, y, "Helvetica", 10.5, INK, cw) - 14

    y = label(c, "Color palette", M, y)
    y = swatch_row(c, d["palette"], M, y - 54, cw) - 46

    y = label(c, "Typography", M, y)
    y = para(c, d["type"], M, y, "Helvetica", 10.5, INK, cw) - 14

    # two columns: maps to / risk
    col_w = (cw - 24) / 2
    y0 = y
    label(c, "Maps to", M, y0)
    para(c, d["maps"], M, y0 - 16, "Helvetica", 10, INK, col_w)
    label(c, "Watch out", M + col_w + 24, y0)
    para(c, d["risk"], M + col_w + 24, y0 - 16, "Helvetica", 10, MUTED, col_w)

    footer(c, page)
    c.showPage()


def recommendation(c, page):
    c.setFillColor(PAPER)
    c.rect(0, 0, W, H, stroke=0, fill=1)
    cw = W - 2 * M

    c.setFillColor(FAINT)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(M, H - 70, "RECOMMENDATION")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 27)
    c.drawString(M, H - 100, "One brand, two registers.")
    c.setStrokeColor(LINE)
    c.line(M, H - 122, W - M, H - 122)

    y = H - 150
    y = para(
        c,
        "Lead with Direction 01 (The quiet authority) as the corporate brand. It matches "
        "who signs the contract: CHROs and people leaders making board-level, crore-level "
        "decisions need banking-grade trust, calm density, and daily-use comfort.",
        M, y, "Helvetica", 10.5, INK, cw,
    ) - 10
    y = para(
        c,
        "Borrow Direction 03 (The daily ritual) for employee-facing surfaces — streaks, "
        "missions, recognition. The buyer sees authority; the workforce feels energy. "
        "One brand system, two registers.",
        M, y, "Helvetica", 10.5, INK, cw,
    ) - 24

    y = label(c, "Why this split works", M, y)
    points = [
        "It mirrors proven products: Mercury's calm for the money owner, Cal AI's energy for the daily user.",
        "Both registers already exist as working dashboards (Fintech calm and GenAlpha), so the brand ships with proof.",
        "Shared spine keeps it one brand: periwinkle/indigo accent family, near-black ink, warm-neutral canvases, restrained reds reserved for genuine risk.",
        "Direction 02's warmth survives as the photography and copy layer inside Direction 01 — human faces, editorial pull-quotes — so authority never reads cold.",
    ]
    for p in points:
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(M, y, "—")
        y = para(c, p, M + 18, y, "Helvetica", 10.5, INK, cw - 18) - 6
    y -= 18

    y = label(c, "Suggested next steps", M, y)
    steps = [
        "Pick the lead territory as a team (this doc is the vote).",
        "Develop the chosen direction into a full brand sheet: logo refinement, imagery style, do/don't examples.",
        "Pressure-test the palette on the matching dashboard route before locking tokens.",
    ]
    for i, s in enumerate(steps, 1):
        c.setFillColor(MUTED)
        c.setFont("Helvetica-Bold", 10.5)
        c.drawString(M, y, f"{i}.")
        y = para(c, s, M + 18, y, "Helvetica", 10.5, INK, cw - 18) - 6

    footer(c, page)
    c.showPage()


def main():
    out = "/Users/jizan/Documents/Claude Code/Vadal.ai/Vadal-Brand-Positioning.pdf"
    c = canvas.Canvas(out, pagesize=A4)
    c.setTitle("Vadal.ai — Brand positioning: three directions")
    c.setAuthor("oliandhue")
    cover(c)
    for i, d in enumerate(DIRECTIONS):
        direction_page(c, d, i + 2)
    recommendation(c, 5)
    c.save()
    print("written:", out)


if __name__ == "__main__":
    main()
