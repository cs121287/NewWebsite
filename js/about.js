var rule = CSSRulePlugin.getRule("span:after");

// Timeline for animations
var tl = gsap.timeline({defaults:{duration: 1}});
tl.from(".anim1", {y:-50, stagger: .6, opacity: 0})
  .to(rule, {duration: 1.8, cssRule: {scaleY: 0}}, "-=2.2")
  .from(".about-section", {backgroundPosition: '200px 0px', opacity: 0}, "-=1.5")
  .from(".about-image img", {y:30, opacity: 0}, "-=.5");

// Add event listener if needed for any interactive elements
// Example: document.getElementById('cta').addEventListener('click', () => {
//   tl.reversed() ? tl.play() : tl.reverse();
// });