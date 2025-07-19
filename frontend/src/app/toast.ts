import Swal from 'sweetalert2';

export function showSuccesToast(title: string, text: string) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'success',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-right',
        toast: true,
        timerProgressBar: true,
    })
}

export function showErrorToast(title: string, text: string) {
    Swal.fire({
        title: title,
        text: text,
        icon: 'error',
        showConfirmButton: false,
        timer: 1500,
        position: 'top-right',
        toast: true,
        timerProgressBar: true,
    })
}