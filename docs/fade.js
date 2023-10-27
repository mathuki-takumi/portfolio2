( function(){
  // 監視対象の要素を取得
  const textItems = document.querySelectorAll('.fade-text');
  
  // 監視対象の要素に対する処理
  const showElements = ( entries ) => {
    entries.forEach( entry => {
      if ( entry.isIntersecting ) {
        // 監視対象の条件を満たしたら .reveal を追加
        entry.target.classList.add( 'reveal' );
      } else {
        // 監視対象の条件から外れたら .reveal を削除
        // ※アニメーションを繰り返さない場合はコメントアウト
        entry.target.classList.remove( 'reveal' );
      }
    } );
  }
 
  // 監視対象が到達したとみなす条件
  const options = {
    rootMargin: '0px',
    threshold: 1.0, // [0-1]
  };
 
  // 監視の内容、条件
  const observer = new IntersectionObserver( showElements, options );
 
  // 対象要素すべてについて監視を開始
  textItems.forEach( text => {
    observer.observe( text );
  } );
} )();