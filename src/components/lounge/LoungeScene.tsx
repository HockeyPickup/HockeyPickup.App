import { JSX } from 'react';

// Drawn on a 320x176 canvas. The screen's rink is laid out from these so the lines stay aligned.
const SCREEN = { x: 142, y: 16, width: 144, height: 84 };
const RINK = { x: 148, y: 24, width: 132, height: 68 };
const CENTER_X = RINK.x + RINK.width / 2;
const CENTER_Y = RINK.y + RINK.height / 2;

const JERSEY = '#0ca678';
const GEAR = '#f1f3f5';
const GEAR_EDGE = '#ced4da';

const SCENE_CSS = `
  .lounge-puck { animation: lounge-puck 4.8s ease-in-out infinite; }
  .lounge-glove { transform-box: view-box; transform-origin: 100px 116px; animation: lounge-glove 1.4s ease-in-out infinite alternate; }
  .lounge-screen-glow { animation: lounge-flicker 3.2s ease-in-out infinite alternate; }
  @keyframes lounge-puck {
    0%, 100% { transform: translate(202px, 50px); }
    30% { transform: translate(224px, 64px); }
    55% { transform: translate(258px, 58px); }
    70% { transform: translate(268px, 58px); }
  }
  @keyframes lounge-glove { from { transform: rotate(-7deg); } to { transform: rotate(5deg); } }
  @keyframes lounge-flicker { from { opacity: 0.75; } to { opacity: 1; } }
  @media (prefers-reduced-motion: reduce) {
    .lounge-puck, .lounge-glove, .lounge-screen-glow { animation: none; }
    .lounge-puck { transform: translate(224px, 64px); }
  }
`;

/**
 * The lounge itself: a goalie in full gear on the couch, catch glove up, watching a game.
 *
 * Purely decorative — it carries no information the page doesn't state in text — so it is kept
 * small and sits beside the Up Next card rather than taking a row of its own.
 */
export const LoungeScene = (): JSX.Element => (
  <svg
    viewBox='0 0 320 176'
    role='img'
    aria-label='A goalie in full gear on the couch, catch glove raised, watching a hockey game on TV'
    style={{ width: '100%', height: 'auto', display: 'block' }}
  >
    <style>{SCENE_CSS}</style>
    <defs>
      <radialGradient id='lounge-tv-glow' cx='0.67' cy='0.36' r='0.62'>
        <stop offset='0' stopColor='#66C1FA' stopOpacity='0.3' />
        <stop offset='1' stopColor='#66C1FA' stopOpacity='0' />
      </radialGradient>
      <radialGradient id='lounge-lamp-glow' cx='0.5' cy='0.5' r='0.5'>
        <stop offset='0' stopColor='#ffd43b' stopOpacity='0.28' />
        <stop offset='1' stopColor='#ffd43b' stopOpacity='0' />
      </radialGradient>
      <linearGradient id='lounge-couch' x1='0' y1='0' x2='0' y2='1'>
        <stop offset='0' stopColor='#7f52cf' />
        <stop offset='1' stopColor='#462382' />
      </linearGradient>
      <clipPath id='lounge-screen'>
        <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.width} height={SCREEN.height} rx='3' />
      </clipPath>
    </defs>

    {/* Room light: the TV's blue wash and a warm lamp. */}
    <rect className='lounge-screen-glow' width='320' height='176' fill='url(#lounge-tv-glow)' />
    <circle cx='20' cy='40' r='34' fill='url(#lounge-lamp-glow)' />
    <ellipse cx='160' cy='171' rx='150' ry='6' fill='#000' opacity='0.25' />

    {/* Floor lamp */}
    <line x1='20' y1='44' x2='20' y2='166' stroke='#5c5f66' strokeWidth='2' />
    <ellipse cx='20' cy='167' rx='9' ry='2.5' fill='#5c5f66' />
    <path d='M9 44 L31 44 L27 28 L13 28 Z' fill='#ffe8a1' stroke='#e8c25c' strokeWidth='0.8' />

    {/* TV on its console */}
    <rect x='160' y='104' width='110' height='9' rx='3' fill='#2c2e33' />
    <rect x='166' y='113' width='4' height='12' fill='#2c2e33' />
    <rect x='260' y='113' width='4' height='12' fill='#2c2e33' />
    <rect x='136' y='10' width='156' height='96' rx='6' fill='#101113' stroke='#3a3d44' />

    <g clipPath='url(#lounge-screen)'>
      <rect x={SCREEN.x} y={SCREEN.y} width={SCREEN.width} height={SCREEN.height} fill='#dfe9f2' />
      <rect
        x={RINK.x}
        y={RINK.y}
        width={RINK.width}
        height={RINK.height}
        rx='18'
        fill='#f8fbfe'
        stroke='#9aa7b4'
        strokeWidth='1.2'
      />
      <line x1={CENTER_X} y1={RINK.y} x2={CENTER_X} y2={RINK.y + RINK.height} stroke='#e03131' strokeWidth='2' />
      <line x1={CENTER_X - 20} y1={RINK.y} x2={CENTER_X - 20} y2={RINK.y + RINK.height} stroke='#1c7ed6' strokeWidth='2' />
      <line x1={CENTER_X + 20} y1={RINK.y} x2={CENTER_X + 20} y2={RINK.y + RINK.height} stroke='#1c7ed6' strokeWidth='2' />
      <circle cx={CENTER_X} cy={CENTER_Y} r='9' fill='none' stroke='#1c7ed6' strokeWidth='1' />
      <line x1='158' y1='29' x2='158' y2='87' stroke='#e03131' strokeWidth='0.8' />
      <line x1='270' y1='29' x2='270' y2='87' stroke='#e03131' strokeWidth='0.8' />
      <path d='M158 52 A6 6 0 0 1 158 64 Z' fill='#a5d8ff' />
      <path d='M270 52 A6 6 0 0 0 270 64 Z' fill='#a5d8ff' />
      <rect x='154' y='55' width='4' height='6' fill='none' stroke='#e03131' strokeWidth='0.8' />
      <rect x='270' y='55' width='4' height='6' fill='none' stroke='#e03131' strokeWidth='0.8' />

      {/* Skaters and the two goalies in their creases */}
      <circle cx='160' cy='58' r='2.6' fill={JERSEY} />
      <circle cx='268' cy='58' r='2.6' fill='#212529' />
      <circle cx='200' cy='47' r='3' fill='#212529' />
      <circle cx='226' cy='67' r='3' fill={JERSEY} />
      <circle cx='256' cy='62' r='3' fill='#212529' />
      <circle cx='190' cy='72' r='3' fill={JERSEY} />
      <circle className='lounge-puck' r='1.6' fill='#111' />

      {/* Score bug */}
      <rect x='146' y='19' width='70' height='11' rx='2' fill='#1a1b1e' opacity='0.92' />
      <text x='150' y='27' fontSize='7' fontWeight='700' fill='#fff' fontFamily='Inter, sans-serif'>
        LA 3 · SJ 2
      </text>
      <text x='197' y='27' fontSize='6' fontWeight='700' fill='#fcc419' fontFamily='Inter, sans-serif'>
        3RD
      </text>
      <path d={`M${SCREEN.x} ${SCREEN.y} L${SCREEN.x + 60} ${SCREEN.y} L${SCREEN.x} ${SCREEN.y + 50} Z`} fill='#fff' opacity='0.07' />
    </g>

    {/* Goalie stick leaning on the wall */}
    <line x1='313' y1='56' x2='302' y2='132' stroke='#c69c6d' strokeWidth='3.5' strokeLinecap='round' />
    <line x1='302' y1='130' x2='299' y2='160' stroke='#212529' strokeWidth='7' strokeLinecap='round' />
    <path d='M302 156 L303 168 L276 170 L276 164 Z' fill='#212529' />

    {/* The goalie, seen from behind: chest protector shoulders, mask and backplate */}
    <ellipse cx='128' cy='124' rx='38' ry='15' fill={JERSEY} />
    <path d='M92 120 Q128 108 164 120' fill='none' stroke='#fff' strokeWidth='3' opacity='0.85' />
    <ellipse cx='128' cy='96' rx='17' ry='19' fill={GEAR} stroke={GEAR_EDGE} />
    <ellipse cx='128' cy='96' rx='5' ry='19' fill={JERSEY} />
    <rect x='118' y='104' width='20' height='12' rx='5' fill='#dee2e6' stroke='#adb5bd' />
    <line x1='110' y1='92' x2='109' y2='106' stroke='#adb5bd' strokeWidth='1.5' />
    <line x1='146' y1='92' x2='147' y2='106' stroke='#adb5bd' strokeWidth='1.5' />

    {/* Catch glove raised for the goal */}
    <g className='lounge-glove'>
      <line x1='100' y1='116' x2='86' y2='80' stroke={JERSEY} strokeWidth='11' strokeLinecap='round' />
      <rect x='77' y='74' width='18' height='9' rx='3' fill={GEAR} stroke={GEAR_EDGE} />
      <path d='M73 76 C62 62 68 42 84 42 C98 42 104 56 97 74 Z' fill={GEAR} stroke={GEAR_EDGE} />
      <path d='M76 48 L92 60 M92 48 L76 60 M84 44 L84 62' stroke='#868e96' strokeWidth='1' />
      <path d='M72 70 Q85 64 98 70' fill='none' stroke={JERSEY} strokeWidth='2.5' />
    </g>

    {/* Couch: back and arms, facing the TV */}
    <rect x='40' y='118' width='190' height='50' rx='16' fill='url(#lounge-couch)' />
    <path d='M52 120 Q135 112 218 120' fill='none' stroke='#a07de0' strokeWidth='2' opacity='0.6' />
    <rect x='24' y='108' width='34' height='60' rx='14' fill='#5A2F9F' />
    <rect x='212' y='108' width='34' height='60' rx='14' fill='#5A2F9F' />
    <circle cx='92' cy='142' r='2' fill='#321765' />
    <circle cx='135' cy='142' r='2' fill='#321765' />
    <circle cx='178' cy='142' r='2' fill='#321765' />
    <rect x='36' y='166' width='8' height='5' rx='1' fill='#3b2a1a' />
    <rect x='226' y='166' width='8' height='5' rx='1' fill='#3b2a1a' />

    {/* Blocker arm draped along the couch back */}
    <line x1='156' y1='118' x2='176' y2='116' stroke={JERSEY} strokeWidth='10' strokeLinecap='round' />
    <rect x='172' y='106' width='24' height='15' rx='3' fill={GEAR} stroke={GEAR_EDGE} />
    <rect x='172' y='106' width='24' height='4' rx='2' fill={JERSEY} />

    {/* Popcorn on the arm */}
    <circle cx='36' cy='95' r='3' fill='#fff3bf' stroke='#fcc419' strokeWidth='0.5' />
    <circle cx='41' cy='93' r='3' fill='#fff3bf' stroke='#fcc419' strokeWidth='0.5' />
    <circle cx='46' cy='95' r='3' fill='#fff3bf' stroke='#fcc419' strokeWidth='0.5' />
    <circle cx='41' cy='97' r='3' fill='#fff3bf' stroke='#fcc419' strokeWidth='0.5' />
    <path d='M31 97 L51 97 L48 112 L34 112 Z' fill='#fff' />
    <path d='M35 97 L39 97 L39 112 L36.5 112 Z' fill='#e03131' />
    <path d='M43 97 L47 97 L45.5 112 L43 112 Z' fill='#e03131' />
  </svg>
);
