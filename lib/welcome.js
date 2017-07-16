let g_makeTexts = require('./makeTexts');
const welcomeText =
`
=== 환영합니다 ===

온라인 웹기반 평행세계 탐험 텍스트 머드(multi user dungeon) 게임 에 오신것을 환영합니다.
현재는 시스템 개발중의 테스트 버전이며, 게임 내용은 저장되지 않습니다.

게임 플레이시 궁금한 부분은 [도움] 명령을 사용해주세요.

https://twitter.com/simplemudonline

궁금한 것이 있으시면 위의 계정으로 연락 주세요.

감사합니다.
`;

let Welcome = function () {
    this.welcomeText = g_makeTexts.ReplaceNLToBr(g_makeTexts.ReplaceKeyword(welcomeText + "\n"));

};

Welcome.prototype.GetText = function () {
    return this.welcomeText;
};

let welcome = new Welcome();

module.exports = welcome.GetText();
