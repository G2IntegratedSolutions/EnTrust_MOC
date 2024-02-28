import banner from './assets/banner.png';
import arrow from './assets/arrow.png';
import styles from './HomePage.module.css';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const HomePage: React.FC = () => {

    const { isAuthenticated, logout, user } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    }, [isAuthenticated, navigate]);
    return (
        isAuthenticated ? (
            <div>
                <div className="row">
                    <div className="col-lg-4">
                        {isAuthenticated ? (
                            <div className={`${styles.box} ${styles.green}`}>
                                <Link to="/myChangeNotifications">
                                    <h3>My Change Notifications</h3>
                                </Link>
                            </div>
                        ) : (<div></div>)}
                    </div>
                    {/* <div className="col-lg-4">
                        {user?.isAdmin && (
                            <div className={`${styles.box} ${styles.blue}`}>
                                <h3>Reports</h3>
                            </div>
                        )}
                    </div> */}
                    <div className="col-lg-4">

                        <div className={`${styles.box} ${styles.blue}`}>
                            <div className={`${user?.isAdmin === false ? styles.disabled2 : ''}`}>
                                <Link to="/admin" >
                                    <h3>Administration</h3>
                                    <p>(must be logged in as "Administrator")</p>
                                </Link>
                            </div>
                        </div>

                    </div>
                    <div className="col-lg-4">

                        <div className={`${styles.box} ${styles.orange}`}>
                            <Link to="/admin">
                                <h3>UNSAFE Administration</h3>
                                <p>Creating users and groups should be blocked on the server!</p>
                                <p>This is for testing purposes only</p>
                            </Link>
                        </div>

                    </div>
                </div>

            </div>
        ) : (
            <h1>Please login</h1>
        )
    )
};

export default HomePage;