import { SyntheticEvent } from 'react';

// material-ui
import { Alert, Button, Fade, Grow, Slide, SlideProps, Stack } from '@mui/material';
import MuiSnackbar from '@mui/material/Snackbar';

// project-imports
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { dispatch, useSelector } from '../../store';


import { KeyedObject } from '../../types/root'
import { closeSnackbar } from '../../store/reducer/snackbar'

// animation function
function TransitionSlideLeft(props: SlideProps) {
    return <Slide {...props} direction="left" />;
}

function TransitionSlideUp(props: SlideProps) {
    return <Slide {...props} direction="up" />;
}

function TransitionSlideRight(props: SlideProps) {
    return <Slide {...props} direction="right" />;
}

function TransitionSlideDown(props: SlideProps) {
    return <Slide {...props} direction="down" />;
}

function GrowTransition(props: SlideProps) {
    return <Grow {...props} />;
}

// animation options
const animation: KeyedObject = {
    SlideLeft: TransitionSlideLeft,
    SlideUp: TransitionSlideUp,
    SlideRight: TransitionSlideRight,
    SlideDown: TransitionSlideDown,
    Grow: GrowTransition,
    Fade
};

// ==============================|| SNACKBAR ||============================== //

const Snackbar = () => {
    const { actionButton, alert, close, message, open, transition, variant } = useSelector((state) => state.snackbar);

    const handleClose = (event: SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        dispatch(closeSnackbar());
    };

    return (
        <>
            {/* default snackbar */}
            {variant === 'default' && (
                <MuiSnackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                    message={message}
                    TransitionComponent={animation[transition]}
                    action={
                        <>
                            <Button color="secondary" size="small" onClick={handleClose}>
                                UNDO
                            </Button>
                            <IconButton
                                onClick={handleClose}
                                aria-label="close"
                                sx={{
                                    color: '#fff',         // Set icon color to white
                                    padding: '4px',        // Reduce padding (makes it smaller)
                                    fontSize: '1rem'       // Optional: Reduce icon size slightly
                                }}
                            >
                                <CloseIcon sx={{ fontSize: '1rem' }} /> {/* Smaller icon */}
                            </IconButton>

                        </>
                    }
                />
            )}

            {/* alert snackbar */}
            {variant === 'alert' && (
                <MuiSnackbar
                    TransitionComponent={animation[transition]}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={open}
                    autoHideDuration={6000}
                    onClose={handleClose}
                >
                    <Alert
                        variant={alert.variant}
                        color={alert.color}
                        action={
                            <Stack direction="row" alignItems="center">
                                {actionButton !== false && (
                                    <Button color={alert.color} size="small" onClick={handleClose}>
                                        UNDO
                                    </Button>
                                )}
                                {close !== false && (
                                    <IconButton
                                        onClick={handleClose}
                                        aria-label="close"
                                        sx={{
                                            color: '#fff',         // Set icon color to white
                                            padding: '4px',        // Reduce padding (makes it smaller)
                                            fontSize: '1rem'       // Optional: Reduce icon size slightly
                                        }}
                                    >
                                        <CloseIcon sx={{ fontSize: '1rem' }} /> {/* Smaller icon */}
                                    </IconButton>

                                )}
                            </Stack>
                        }
                        sx={{
                            ...(alert.variant === 'outlined' && {
                                bgcolor: 'common.white'
                            })
                        }}
                    >
                        {message}
                    </Alert>
                </MuiSnackbar>
            )}
        </>
    );
};

export default Snackbar;
