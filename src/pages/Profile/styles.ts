import styled from 'styled-components/native';
import { Platform } from 'react-native';
import { getBottomSpace } from 'react-native-iphone-x-helper'
import { RectButton } from 'react-native-gesture-handler';


export const Container = styled.View`
    flex: 1;
    justify-content: center;
    padding: 0 30px ${Platform.OS === 'android' ? 110 : 40}px;
    position: relative;
`;

export const Title = styled.Text`
    font-size: 20px;
    color: #f4ede8;
    font-family: 'RobotoSlab-Medium';
    margin: 20px 0;
`;

export const BackButton = styled.TouchableOpacity`
    margin-left: 24px;
    margin-top: 64px;
`;



export const UserAvatarButton = styled.TouchableOpacity`
    margin-top: 60px;
`;

export const UserAvatar = styled.Image`
    width: 96px;
    height: 96px;
    border-radius: 48px;
    
    align-self: center;
`;





