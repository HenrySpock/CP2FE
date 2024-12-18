// Emoji.js
import React from 'react';

const emojis = [
  "😀",  "😃",  "😄",  "😁",  "😆",  "😅",  "🤣",  "😂",  "🙂",  "🙃",  "🫠",  "😉", "😊",  
  "😇",  "🥰",  "😍",  "🤩",  "😘",  "😗",  "☺",  "😚",  "😙",  "🥲",   "😋",   "😛", "😜",  
  "🤪",  "😝",  "🤑",  "🤗",  "🤭",  "🫢",  "🫣",  "🤫",  "🤔",  "🫡",  "🤐",  "🤨",  "😐",  
  "😑",  "😶",  "🫥",  "😶‍🌫️",  "😏",  "😒",  "🙄",  "😬",  "😮‍💨",  "🤥",  "🫨",  "🙂‍",  "😌",  
  "😔",  "😪",  "🤤",  "😴",  "😷",  "🤒",  "🤕",  "🤢",  "🤮",  "🤧",  "🥵",  "🥶",  "🥴",  
  "😵",  "😵‍💫",  "🤯",  "🤠",  "🥳",  "🥸",  "😎",  "🤓",  "🧐",  "😕",  "🫤",  "😟",  "🙁",  
  "☹",  "😮",  "😯",  "😲",  "😳",  "🥺",  "🥹",  "😦",  "😧",  "😨",  "😰",  "😥",  "😢",  
  "😭",  "😱",  "😖",  "😣",  "😞",  "😓",  "😩",  "😫",  "🥱",  "😤",  "😡",  "😠",  "🤬",  
  "😈",  "👿",  "💀",  "☠",  "💩",  "🤡",  "👹",  "👺",  "👻",  "👽",  "👾",  "🤖",  "😺",  
  "😸",  "😹",  "😻",  "😼",  "😽",  "🙀",  "😿",  "😾",  "🙈",  "🙉",  "🙊",  "💌",  "💘",  
  "💝",  "💖",  "💗",  "💓",  "💞",  "💕",  "💟",  "❣",  "💔",  "❤️‍🔥",  "❤️‍🩹",  "❤",  "🩷",  
  "🧡",  "💛",  "💚",  "💙",  "🩵",  "💜",  "🤎",  "🖤",  "🩶",  "🤍",  "💋",  "💯",  "💢",
  "💥",  "💫",  "💦",  "💨",  "🕳",  "💬",  "🗨",  "🗯",  "💭",  "💤",  "👋",  "🤚",   "🖐",  
  "✋",  "🖖",  "🫱",  "🫲",  "🫳",  "🫴",  "🫷",  "🫸",  "👌",  "🤌",  "🤏",  "✌",  "🤞",  
  "🫰",  "🤟",  "🤘",  "🤙",  "👈",  "👉",  "👆", "👇",  "☝",  "🫵",  "👍",  "👎",   "✊",  
  "👊",  "🤛",  "🤜",  "👏",  "🙌",  "🫶",  "👐",  "🤲",  "🤝",  "🙏"
];

const Emoji = ({ insertEmoji, closeModal }) => {
  return (
    <div className="emojiOverlay">
      <div className="emojiModalStyle">
        <div className="emojiGridStyle">
          {emojis.map(emoji => (
            <button className="emoji" key={emoji} onClick={() => insertEmoji(emoji)}>
              {emoji}
            </button>
          ))}
        </div>
        <button className="close-emoji" onClick={closeModal} >Close</button>
      </div>
    </div>
  );
};

export default Emoji;
