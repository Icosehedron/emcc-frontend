import { BottomNavigation, BottomNavigationAction, Container, Typography } from '@material-ui/core';
import { styled } from '@material-ui/core/styles';

// NAVIGATION BAR

export const SNav = styled(BottomNavigation)({
    background: 'rgb(150,0,0)'
});


export const SNavButton = styled(BottomNavigationAction)({
    color: "#999999"
    // TODO: figure out how to change the selected button color
    /*
    root: {
        '&$selected': {
            color: "#AAAAAA"
        }
    }
    */
});

// ALL PAGES

export const SHeading = styled(Typography)({
    textAlign: 'center',
    paddingTop: '20px',
    paddingBottom: '40px'
});

export const SContent = styled(Container)({
    textAlign: 'left',
    paddingBottom: '40px',
    marginBottom: '40px'
});

export const SContentHeading = styled(Typography)({
    textAlign: 'center',
    paddingTop: '10px',
    paddingBottom: '10px'
});

// HOME PAGE

export const SHero = styled(Container)({
    background: 'rgb(140,0,0)',
    height: '70vh',
    minHeight: 'fit-content',
    color: '#EEEEEE',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
});

export const SHeroHeading = styled(Typography)({
    fontSize: 'calc(10vw + 4.0rem)'
});

export const SHeroSubheading = styled(Typography)({
    paddingBottom: '15px'
});