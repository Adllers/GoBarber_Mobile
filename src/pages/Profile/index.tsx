import React, { useRef, useCallback } from 'react';
import { Image, View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert, Text  } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { Form } from '@unform/mobile';
import { FormHandles} from '@unform/core'; 

import * as Yup from 'yup';
import Icon from 'react-native-vector-icons/Feather';
import getValidationErrors from '../../utils/getValidationErrors';

import api from '../../services/api';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Title, BackButton, UserAvatarButton, UserAvatar  } from './styles';
import { useAuth } from '../../hooks/auth';
import ImagePicker from 'react-native-image-picker';


interface ProfileFormData {
    name: string;
    email: string;
    password: string;
    old_password: string;
    password_confirmation: string;
}

const Profile: React.FC = () => {
    
    const { user, updateUser } = useAuth();

    const formRef = useRef<FormHandles>(null);
    const navigation = useNavigation();

    const emailInputRef = useRef<TextInput>(null)
    const oldPasswordInputRef = useRef<TextInput>(null)
    const passwordInputRef = useRef<TextInput>(null)
    const confirmPasswordInputRef = useRef<TextInput>(null)

    const handleSignUp = useCallback(async (data: ProfileFormData) => {
        
        try {

            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome Obrigatório!'),
                email: Yup.string().required('E-mail Obrigatório!').email('Digite um email válido!'),
                old_password: Yup.string(),
                password: Yup.string().when('old_password', {is: val => !!val.length, then: Yup.string().required('Campo obrigatório'), otherwise: Yup.string()}),
                password_confirmation: Yup.string().when('old_password', {is: val => !!val.length, then: Yup.string().required('Campo obrigatório'), otherwise: Yup.string()}).oneOf([Yup.ref('password'), undefined], 'Confirmação de senha incorreta!'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            const formData = Object.assign({
                name: data.name,
                email: data.email,
            }, data.old_password ? {
                old_password: data.old_password,
                password: data.password,
                password_confirmation: data.password_confirmation,
            } : {});

            const response = await api.put('/profile', formData);

            updateUser(response.data);


            Alert.alert('Perfil atualizado com sucesso!');

            navigation.goBack();

        } catch (err) {

            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);

                return;
            }
            
            Alert.alert('Erro na atualização do Perfil!', 'Tente novamente!');
        }
    },[navigation]);


    const handleGoBack = useCallback(() => {
        
        navigation.goBack();
        
    }, [navigation]);

    
    const handleUpdateAvatar = useCallback(() => {
        
        ImagePicker.showImagePicker({
        
            title: 'Selecione um Avatar',
            cancelButtonTitle: 'Cancelar',
            takePhotoButtonTitle: 'Usar câmera',
            chooseFromLibraryButtonTitle: 'Escolher da galeria'
        
        }, (response) => {
            
            if (response.didCancel) {
                return;
            } 
            
            if (response.error) {
                Alert.alert('Erro ao atualizar o seu avatar!');
                return;
            } 
            
            const data = new FormData();

            data.append('avatar', {
                type: 'iamge/jpg',
                name: `${user.id}.jpg`,
                uri: response.uri,
            });
            // You can also display the image using data:
            // const source = { uri: 'data:image/jpeg;base64,' + response.data };

            api.patch('users/avatar', data).then(apiResponse => {
               updateUser(apiResponse.data); 
            });
        },);
    }, [updateUser, user.id]);

    return (
        <>
            <KeyboardAvoidingView 
                style={{ flex:1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                enabled
            >
            <ScrollView
                contentContainerStyle={{flex:1}}
                keyboardShouldPersistTaps="handled"
            >
                <Container>
                    
                    

                    <UserAvatarButton onPress={handleUpdateAvatar}>
                        <UserAvatar source={{ uri: user.avatar_url}}></UserAvatar>
                    </UserAvatarButton>

                    <View>
                        <Title>Meu Perfil</Title>
                    </View>

                    <Form initialData={user} ref={formRef} onSubmit={handleSignUp}>
                        <Input autoCapitalize="words" name="name" icon="user" placeholder="Nome" returnKeyType="send" onSubmitEditing={() => { emailInputRef.current?.focus()}}/>
                        <Input ref={emailInputRef} keyboardType="email-address" autoCorrect={false} autoCapitalize="none" name="email" icon="mail" placeholder="E-mail" returnKeyType="next" onSubmitEditing={() => { oldPasswordInputRef.current?.focus()}}/>
                        <Input ref={oldPasswordInputRef} secureTextEntry name="old_password" icon="lock" placeholder="Senha Atual" containerStyle={{ marginTop: 16}} textContentType="newPassword" returnKeyType="next" onSubmitEditing={() => passwordInputRef.current?.focus()} />
                        <Input ref={passwordInputRef} secureTextEntry name="password" icon="lock" placeholder="Nova Senha" textContentType="newPassword" returnKeyType="next" onSubmitEditing={() => confirmPasswordInputRef.current?.focus()} />
                        <Input ref={confirmPasswordInputRef} secureTextEntry name="password_confirmation" icon="lock" placeholder="Confirmar Nova Senha" textContentType="newPassword" returnKeyType="send" onSubmitEditing={() => formRef.current?.submitForm()} />
                        <Button onPress={() => {formRef.current?.submitForm()}}>Confirmar Mudanças</Button>
                    </Form>
                
                </Container>
            </ScrollView>
            </KeyboardAvoidingView>
        </>
    );
}

export default Profile;

