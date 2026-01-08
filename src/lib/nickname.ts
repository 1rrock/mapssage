export const adjectives = [
    '행복한', '즐거운', '따뜻한', '설레는', '반가운', '상냥한', '다정한', '포근한', '신나는', '명랑한',
    '용감한', '씩씩한', '활기찬', '자유로운', '평화로운', '소중한', '정직한', '지혜로운', '친절한', '성실한'
];

export const nouns = [
    '여행자', '탐험가', '우체부', '편지', '구름', '바람', '햇살', '별빛', '달빛', '나무',
    '꽃잎', '나비', '새', '고양이', '강아지', '친구', '이웃', '소식', '하루', '추억'
];

export function generateRandomNickname(): string {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective} ${noun}`;
}
