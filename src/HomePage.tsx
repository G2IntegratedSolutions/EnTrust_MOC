import banner from './assets/banner.png';
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Props = {
    message: string;
};

const HomePage: React.FC<Props> = ({ message }) => {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <div>
            <header className="bg-light text-black py-3" >
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col text-left">
                            <img src={banner} alt="Header Logo" className="img-fluid header-logo" />
                        </div>
                        <div className="col text-left">
                            <div className={styles.mocManager + " text-center"}>MOC MANAGER</div>
                            <div className={styles.manageYourChange + " text-center"}>manage your change</div>
                        </div>
                        <div className="col-auto ms-auto">
                            <Link to="/login">
                                <div>
                                    {isAuthenticated ? (
                                        <>
                                            <div>Logged in as {user?.userName} {user?.isAdmin ? "ADMIN" : "USER"}</div>
                                            <div onClick={logout}>Logout</div>
                                        </>
                                    ) : (
                                        <div>Login</div>
                                    )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </header>
            <div className="row">
                <div className="col-lg-4">
                    {isAuthenticated ? (
                        <div className={`${styles.box} ${styles.green}`}>
                            <h3>Change Notifications</h3>
                        </div>
                    ) : (<div></div>)}
                </div>
                <div className="col-lg-4">
                    {user?.isAdmin  && (
                        <div className={`${styles.box} ${styles.blue}`}>
                            <h3>Reports</h3>
                        </div>
                    )}
                </div>
                <div className="col-lg-4">
                    {user?.isAdmin  && (
                        <div className={`${styles.box} ${styles.orange}`}>
                            <Link to="/admin">
                                <h3>Administration</h3>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
    ;

export default HomePage;