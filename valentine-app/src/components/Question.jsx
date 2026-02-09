import { useState, useCallback } from 'react'

const noMsgs = [
  'Үгүй гэж болохгүй 🥺',
  'Дахиад бодоод үз 💭',
  'Зүрх минь эвдэрч байна 💔',
  'Яг үнэндээ? 😢',
  'Чи дуртайл байгаа биздээ 🤔',
  'Чи битий нэрэлхээд байлдаа 😤',
  'Миний зүрх... 😭',
  'Плиииз 🥹',
  'Сүүлийн боломж чинь шүү харамсваа 🤡',
]

export default function Question({ onYes }) {
  const [noCount, setNoCount] = useState(0)
  const [noStyle, setNoStyle] = useState({})
  const [noText, setNoText] = useState('Үгүй 💔')
  const [yesScale, setYesScale] = useState(1)

  const handleNo = useCallback(() => {
    const rx = (Math.random() - 0.5) * 220
    const ry = (Math.random() - 0.5) * 160

    setNoStyle({
      position: 'absolute',
      left: `calc(50% + ${rx}px)`,
      top: `calc(50% + ${ry}px)`,
      transform: 'translate(-50%, -50%)',
    })

    const next = noCount + 1
    setNoCount(next)
    setNoText(next < noMsgs.length ? noMsgs[next] : '...')
    setYesScale(prev => Math.min(prev + 0.1, 1.6))
  }, [noCount])

  return (
    <div className="page page-enter">
      <div className="glass" style={{ padding: '44px 36px', textAlign: 'center', maxWidth: 500, width: '100%' }}>

        {/* Bear */}
        <div className="bear-wrap">
          <div className="bear">
            <div className="bear-ear bear-ear-l" />
            <div className="bear-ear bear-ear-r" />
            <div className="bear-head">
              <div className="bear-eye bear-eye-l" />
              <div className="bear-eye bear-eye-r" />
              <div className="bear-face" />
              <div className="bear-nose" />
              <div className="bear-blush bear-blush-l" />
              <div className="bear-blush bear-blush-r" />
            </div>
            <div className="bear-body" />
            <div className="bear-love">💗</div>
          </div>
          <div className="pulse-ring" />
        </div>

        <h2 className="font-script" style={{ fontSize: '2.1rem', color: 'var(--pink)', marginBottom: 32 }}>
          2.14-нд хамтдаа гоё байж болон шдээ Чи надтай гал халуун шөнийг өнгөрөөх үү? 🥺
        </h2>

        <div className="q-btn-wrap">
          <button
            className="yes-btn"
            style={{ transform: `scale(${yesScale})` }}
            onClick={onYes}
          >
            Тийм ❤️
          </button>
          <button
            className="no-btn"
            style={noStyle}
            onMouseEnter={handleNo}
            onClick={handleNo}
          >
            {noText}
          </button>
        </div>
      </div>
    </div>
  )
}
