( function(){
  // �Ď��Ώۂ̗v�f���擾
  const textItems = document.querySelectorAll('.fade-text');
  
  // �Ď��Ώۂ̗v�f�ɑ΂��鏈��
  const showElements = ( entries ) => {
    entries.forEach( entry => {
      if ( entry.isIntersecting ) {
        // �Ď��Ώۂ̏����𖞂������� .reveal ��ǉ�
        entry.target.classList.add( 'reveal' );
      } else {
        // �Ď��Ώۂ̏�������O�ꂽ�� .reveal ���폜
        // ���A�j���[�V�������J��Ԃ��Ȃ��ꍇ�̓R�����g�A�E�g
        entry.target.classList.remove( 'reveal' );
      }
    } );
  }
 
  // �Ď��Ώۂ����B�����Ƃ݂Ȃ�����
  const options = {
    rootMargin: '0px',
    threshold: 1.0, // [0-1]
  };
 
  // �Ď��̓��e�A����
  const observer = new IntersectionObserver( showElements, options );
 
  // �Ώۗv�f���ׂĂɂ��ĊĎ����J�n
  textItems.forEach( text => {
    observer.observe( text );
  } );
} )();