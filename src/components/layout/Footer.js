import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa"
import styles from "./Footer.module.css"

function Footer(){
    return (
        <footer>
            <ul className={styles.social_list}>
                <li><FaInstagram /></li>
                <li><FaFacebook /></li>
                <li><FaLinkedin /></li>
            </ul>
            <p>Nosso Rodapé</p>
        </footer>
    )
}

export default Footer