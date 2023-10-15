import Icon from '@/web/components/Icon'
import useKeyboardShortcuts from '@/web/hooks/useKeyboardShortcuts'
import useOSPlatform from '@/web/hooks/useOSPlatform'
import useSettings from '@/web/hooks/useSettings'
import settings, { KeyboardShortcuts } from '@/web/states/settings'
import { t } from 'i18next'
import { toString as event2String } from 'keyboard-event-to-string'
import { FC, KeyboardEventHandler, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { BlockTitle, Option, OptionText, Switch } from './Controls'

const ShortcutSwitchSettings = () => {
  const {
    keyboardShortcuts: { globalEnabled },
  } = useSettings()

  return (
    <>
      <BlockTitle>{t`settings.keyboard-shortcuts.title`}</BlockTitle>
      <Option>
        <OptionText>{t`settings.keyboard-shortcuts.enable-global`}</OptionText>
        <Switch
          enabled={globalEnabled}
          onChange={value => (settings.keyboardShortcuts.globalEnabled = value)}
        />
      </Option>
    </>
  )
}

const ShortcutBindingInput: FC<{
  value: string | null
  onChange?: (value: string | null) => void
}> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState(value)
  const [isBinding, setBinding] = useState(false)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const text = useMemo(() => {
    if (isBinding && inputValue === null) {
      return t`settings.keyboard-shortcuts.binding-input-waiting-keydown-placeholder`
    }

    if (inputValue === null) {
      return ''
    }

    return inputValue
  }, [inputValue, isBinding])

  const clear = () => {
    setInputValue(null)
    onChange?.(null)
  }

  const startBinding = () => {
    setInputValue(null)
    setBinding(true)
  }

  const onKeyDown: KeyboardEventHandler = e => {
    if (!isBinding) {
      return
    }

    if (e.key === 'Escape') {
      clear()
      return
    }

    if (e.key === 'Enter') {
      onChange?.(inputValue)
      setBinding(false)
      return
    }

    const text = event2String(e as any) // React keyboard event -> DOM keyboard event
    setInputValue(text)
  }

  const onBlur = () => {
    if (!isBinding) {
      return
    }

    setInputValue(value)
    setBinding(false)

    if (inputValue !== null) {
      onChange?.(inputValue)
    }
  }

  return (
    <div
      className='group/binding-input mx-2 flex gap-2 rounded-lg bg-stone-400/20 py-1 px-3 font-mono outline-none backdrop-blur'
      onClick={startBinding}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      tabIndex={0}
    >
      <span>{text}</span>
      <button
        onClick={clear}
        className='ml-auto'
        title={t`settings.keyboard-shortcuts.item-clear`!}
      >
        <Icon
          name='x'
          className='ml-auto box-content h-4 w-4 rounded-full p-1 text-stone-300 opacity-0 transition-opacity hover:bg-stone-400/20 group-hover/binding-input:opacity-100 dark:text-stone-400'
        />
      </button>
    </div>
  )
}

const ShortcutItemBindings: FC<{ fnKey: keyof KeyboardShortcuts; name: string }> = ({
  fnKey,
  name,
}) => {
  const keyboardShortcuts = useKeyboardShortcuts()
  const platform = useOSPlatform()

  const updateBinding = (index: 0 | 1) => {
    return (value: string | null) => {
      const conflicted =
        value !== null && Object.values(settings.keyboardShortcuts[platform]).flat().includes(value)

      if (conflicted) {
        toast.error(t`settings.keyboard-shortcuts.keyboard-shortcut-in-used`)
        return
      }

      settings.keyboardShortcuts[platform][fnKey][index] = value
    }
  }

  return (
    <tr className='h-10 rounded-lg hover:bg-stone-100/20 hover:dark:bg-stone-600/10'>
      <td className='px-2 text-left font-normal'>{name}</td>
      <td className='text-center font-normal'>
        <ShortcutBindingInput value={keyboardShortcuts[fnKey][0]} onChange={updateBinding(0)} />
      </td>
      <td className='text-center font-normal'>
        <ShortcutBindingInput value={keyboardShortcuts[fnKey][1]} onChange={updateBinding(1)} />
      </td>
    </tr>
  )
}

const ShortcutBindings = () => {
  return (
    <table className='mt-7 w-full'>
      <thead>
        <tr className='h-10  text-black/50 dark:text-white/50'>
          <th className='px-2 text-left font-normal'>{t`settings.keyboard-shortcuts.function`}</th>
          <th className='text-center font-normal'>{t`settings.keyboard-shortcuts.local`}</th>
          <th className='text-center font-normal'>{t`settings.keyboard-shortcuts.global`}</th>
        </tr>
      </thead>
      <tbody>
        <ShortcutItemBindings fnKey='playPause' name={t`player.play-pause`} />
        <ShortcutItemBindings fnKey='next' name={t`player.next`} />
        <ShortcutItemBindings fnKey='previous' name={t`player.previous`} />
        <ShortcutItemBindings fnKey='volumeUp' name={t`player.volume-up`} />
        <ShortcutItemBindings fnKey='volumeDown' name={t`player.volume-down`} />
        <ShortcutItemBindings fnKey='switchVisibility' name={t`common.hide-show-player`} />
      </tbody>
    </table>
  )
}

const KeyboardShortcuts: FC = () => {
  return (
    <>
      <ShortcutSwitchSettings />
      <ShortcutBindings />
    </>
  )
}

export default KeyboardShortcuts
