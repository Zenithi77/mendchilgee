export default function Welcome({ startDate, onOpen }) {

  return (
    <div className="page page-enter">
      <div className="glass" style={{ padding: '48px 38px', textAlign: 'center', maxWidth: 480, width: '100%' }}>

        {/* Envelope */}
        <div className="envelope-wrap">
          <div className="envelope">
            <div className="env-letter">💌</div>
            <div className="env-body" />
            <div className="env-flap" />
            <div className="env-heart">💝</div>
          </div>
        </div>

        <h1 className="font-script" style={{ fontSize: '2.4rem', color: '#FF85A2', marginBottom: 8, textShadow: '0 0 40px rgba(255,133,162,0.5)' }}>
          Мэндчилгээ 🎉
        </h1>
        <p style={{ fontSize: '0.92rem', color: '#FFC4D0', marginBottom: 28, lineHeight: 1.7 }}>
          Танд зориулсан тусгай<br />мэндчилгээний хуудас ✨
        </p>

        <button className="btn btn-love" onClick={onOpen}>
          Мэндчилгээ нээх 🎁
        </button>
      </div>
    </div>
  )
}
