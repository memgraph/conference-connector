import styles from '../styles/Footer.module.css'



function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.footerHead}>
                <a href="https://github.com/memgraph" target="_blank" rel="noopener noreferrer">
                    <img src='/github-dark-mode.svg' alt='github' />
                </a>
                <a href="https://discourse.memgraph.com/" target="_blank" rel="noopener noreferrer">
                    <img src='/dev-forum-dark-mode.svg' alt='discourse' />
                </a>
                <a href="https://discord.gg/memgraph" target="_blank" rel="noopener noreferrer">
                    <img src='/discord-dark-mode.svg' alt='discord' />
                </a>
                <a href="https://stackoverflow.com/questions/tagged/memgraphdb" target="_blank" rel="noopener noreferrer">
                    <img src='/stack-overflow-dark-mode.svg' alt='stackoverflow' />
                </a>
            </div>
            <div className={styles.footerBottom}>
                <div className={styles.footerLogo}>
                    <a href="https://memgraph.com" target="_blank" rel="noopener noreferrer">
                        <img src='/Memgraph-logo-white-rgb.png' alt='Memgraph Logo'></img>
                    </a>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
