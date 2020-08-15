import React, { useRef, useCallback } from 'react';
import { Image, View, ScrollView, KeyboardAvoidingView, Platform, TextInput, Alert,  } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import { Form } from '@unform/mobile';
import { FormHandles} from '@unform/core'; 

import * as Yup from 'yup';
import getValidationErrors from '../../utils/getValidationErrors';

import api from '../../services/api';

import logoImg from '../../assets/logo.png';

import Input from '../../components/Input';
import Button from '../../components/Button';

import { Container, Title,  BackToSignIn, BackToSignInText } from './styles';

interface SignUpFormData {
    name: string;
    email: string;
    password: string;
}

const SignUp: React.FC = () => {
    
    const formRef = useRef<FormHandles>(null);
    const navigation = useNavigation();

    const emailInputRef = useRef<TextInput>(null)
    const passwordInputRef = useRef<TextInput>(null)

    const handleSignUp = useCallback(async (data: SignUpFormData) => {
        
        try {

            formRef.current?.setErrors({});

            const schema = Yup.object().shape({
                name: Yup.string().required('Nome Obrigatório!'),
                email: Yup.string().required('E-mail Obrigatório!').email('Digite um email válido!'),
                password: Yup.string().min(6, 'No mínimo 6 dígitos!'),
            });

            await schema.validate(data, {
                abortEarly: false,
            });

            await api.post('/users', data).then(() => {
                console.log('ok');
                Alert.alert('sucesso!')
            }).catch((err) => {
                console.log(err);
                Alert.alert(err);
            });

            Alert.alert('Cadastro realizado com sucesso!', 'Você já pode fazer login!');

            navigation.navigate('SignIn');

            
            
        } catch (err) {

            if (err instanceof Yup.ValidationError) {
                const errors = getValidationErrors(err);

                formRef.current?.setErrors(errors);

                return;
            }
            
            Alert.alert('Erro no cadastro', 'Ocorreu um erro ao fazer cadastro');
        }
    },[navigation]);

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
                    
                    <Image source={ logoImg }/>

                    <View>
                        <Title>Crie Sua Conta</Title>
                    </View>

                    <Form ref={formRef} onSubmit={handleSignUp}>
                        <Input autoCapitalize="words" name="name" icon="user" placeholder="Nome" returnKeyType="send" onSubmitEditing={() => { emailInputRef.current?.focus()}}/>
                        <Input ref={emailInputRef} keyboardType="email-address" autoCorrect={false} autoCapitalize="none" name="email" icon="mail" placeholder="E-mail" returnKeyType="send" onSubmitEditing={() => { passwordInputRef.current?.focus()}}/>
                        <Input ref={passwordInputRef} secureTextEntry name="password" icon="lock" placeholder="Senha" textContentType="newPassword" returnKeyType="send" onSubmitEditing={() => formRef.current?.submitForm()} />
                        <Button onPress={() => {formRef.current?.submitForm()}}>Criar Conta</Button>
                    </Form>
                
                </Container>
            </ScrollView>
            </KeyboardAvoidingView>

            <BackToSignIn onPress={() => {navigation.navigate('SignIn')}}>
                <Icon name="arrow-left" size={20} color="#fff" />
                <BackToSignInText>Voltar Para Login</BackToSignInText>
            </BackToSignIn>
        </>
    );
}

export default SignUp;